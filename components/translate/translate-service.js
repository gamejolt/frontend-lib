angular.module( 'gj.Translate' ).service( 'Translate', function( $q, $translate, $injector, $window )
{
	// Do it through injector so no circular reference.
	var App = $injector.get( 'App' );

	/**
	 * TODO: Check to see if this eventually loads in too much data? If .then() doesn't GC the old handlers.
	 */
	var _promise = $q.when();

	/**
	 * Adds partial parts to the translate service.
	 */
	this.addParts = function()
	{
		var $translatePartialLoader = $injector.get( '$translatePartialLoader' );
		angular.forEach( arguments, function( translationKey )
		{
			$translatePartialLoader.addPart( translationKey );
		} );
		_promise = $translate.refresh();
		return _promise;
	};

	/**
	 * Convenience method to set the page title from a translation label.
	 */
	this.pageTitle = function( label, params )
	{
		_promise.then( function()
		{
			$translate( label, params ).then( function( title )
			{
				App.title = title;
			} );
		} );
	};

	/**
	 * Returns a random message for a particular translation label.
	 */
	this.randomMessage = function( label )
	{
		return _promise.then( function()
		{
			return $translate( label + '_count' ).then( function( count )
			{
				count = parseInt( count, 10 );
				var messageIndex = $window._.random( 1, count );
				return label + '_' + messageIndex;
			} );
		} );
	};

	/**
	 * Convenience method to send a Growl based on a translation label.
	 * Note that it can't do the more complicated stuff, but should be fine for
	 * most Growl usages.
	 */
	this.growl = function( type, label, params )
	{
		_promise.then( function()
		{
			$translate( [ label + '_growl', label + '_growl_title' ], params ).then( function( messages )
			{
				// Title is optional.
				var title = undefined;
				if ( messages[ label + '_growl_title' ] != label + '_growl_title' ) {
					title = messages[ label + '_growl_title' ];
				}

				$injector.get( 'Growls' ).add(
					type,
					{
						title: title,
						message: messages[ label + '_growl' ],
						sticky: params && params._sticky ? true : false,
					}
				);
			} );
		} );
	};
} );
