angular.module( 'gj.Growls' ).service( 'Growls', function( $rootScope, $controller, $compile, $q, $injector, $http, $templateCache, $window, Environment )
{
	var _this = this;

	this.incrementer = 0;
	this.messages = [];

	this.add = function()
	{
		var creationPromise;
		var type = arguments[0];
		var options = {};

		if ( angular.isObject( arguments[1] ) ) {
			options = arguments[1];
		}
		else {
			options = { message: arguments[1], title: arguments[2] || undefined };
		}

		options = _.defaults( options, {
			title: null,
			sticky: false,
			onclick: null,
			icon: null,
		} );

		if ( !options.title ) {
			if ( type == 'error' ) {
				options.title = 'Oh no!';
			}
			else if ( type == 'success' ) {
				options.title = 'Huzzah!';
			}
		}

		// If we're a client, we want to instead show this as a system notification.
		// We don't do this if the message is a fancy one with controller, template, etc.
		if ( Environment.isClient && !options.controller ) {
			return createSystemNotification( options );
		}

		++this.incrementer;
		var message = {
			id: this.incrementer,
			type: type,
			title: options.title,
			message: options.message,
			sticky: options.sticky,
			icon: options.icon,
			onclick: options.onclick,
			close: function()
			{
				var selfIndex = _.findIndex( _this.messages, { id: this.id } );

				if ( selfIndex !== -1 ) {
					_this.remove( selfIndex );
				}
			}
		};

		if ( options.controller ) {

			message.scope = $rootScope.$new();

			var locals = {};
			locals.$scope = message.scope;
			locals.$growlMessage = message;

			if ( options.template ) {
				creationPromise = $q.when( options.template );
			}
			else {
				creationPromise = $http.get( angular.isFunction( options.templateUrl ) ? options.templateUrl() : options.templateUrl, { cache: $templateCache } )
					.then( function( result )
					{
						return result.data;
					} );
			}

			var templateContent;
			creationPromise
				.then( function( _templateContent )
				{
					templateContent = _templateContent;

					if ( options.resolve ) {
						return $q.all( getResolvePromises( options.resolve ) )
							.then( function( resolveData )
							{
								var i = 0;
								angular.forEach( options.resolve, function( value, key )
								{
									locals[ key ] = resolveData[ i ];
									++i;
								} );
							} );
					}
				} )
				.then( function()
				{
					var controllerInstance = $controller( options.controller, locals );
					message.scope.growlCtrl = controllerInstance;

					message.element = angular.element( '<div>' + templateContent + '</div>' );
					message.element = $compile( message.element )( message.scope );
				} );
		}
		else {
			creationPromise = $q.when();
		}

		// After the Growl message has been fully created, add it to the messages array.
		creationPromise.then( function()
		{
			_this.messages.unshift( message );
		} );
	};

	// Convenience functions.
	[ 'success', 'info', 'error' ].forEach( function( type )
	{
		this[ type ] = function()
		{
			var args = Array.prototype.slice.call( arguments );
			args.unshift( type );
			this.add.apply( this, args );
		};
	}, this );

	this.remove = function( index )
	{
		_this.messages.splice( index, 1 );
	};

	function getResolvePromises( resolves )
	{
		var promises = [];
		angular.forEach( resolves, function( val )
		{
			if ( angular.isFunction( val ) || angular.isArray( val ) ) {
				promises.push( $q.when( $injector.invoke( val ) ) );
			}
		} );
		return promises;
	}

	function createSystemNotification( options )
	{
		var notifier = require( 'node-notifier' );

		notifier.notify( {
			title: options.title,
			message: options.message,
			icon: options.icon,
			sound: false,
			wait: true,
		} );

		if ( options.onclick ) {
			notifier.on( 'click', function()
			{
				options.onclick();
			} );
		}
	}
} );
