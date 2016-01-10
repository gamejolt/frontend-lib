angular.module( 'gj.Backdrop' ).factory( 'Backdrop', function( $compile, $rootScope, $document, $window )
{
	var KEYCODE_ESC = 27;

	function Backdrop( scopeElement )
	{
		var _this = this;

		this.boundScope = null;
		this.scope = $rootScope.$new( true );

		this.element = angular.element( '<gj-backdrop backdrop-on-click="onClick()"></gj-backdrop>' );
		this.element = $compile( this.element )( this.scope );

		if ( !scopeElement ) {
			this.scopeElement = $document.find( 'body' ).eq( 0 );
		}
		else {
			this.scopeElement = scopeElement;
		}

		this.scopeElement.append( this.element );
		$window.document.body.classList.add( 'backdrop-active' );

		// When the backdrop is clicked, we'll trigger a close.
		this.scope.onClick = function()
		{
			if ( _this.onCloseTrigger ) {
				_this.onCloseTrigger();
			}
		};

		// On press of escape key, we want to trigger a close.
		this.onKeydown = function( event )
		{
			if ( event.keyCode === KEYCODE_ESC ) {
				if ( _this.onCloseTrigger ) {
					_this.onCloseTrigger();
				}
			}
		};

		$document.on( 'keydown', this.onKeydown );
	}

	Backdrop.prototype.bindTo = function( scope )
	{
		var _this = this;

		// Binding to the scope just kills the backdrop when the scope is destroyed.
		this.boundScope = scope;
		this.boundScope.$on( '$destroy', function()
		{
			_this.remove();
		} );
	};

	Backdrop.prototype.remove = function()
	{
		this.scope.$destroy();
		this.element.remove();
		$document.off( 'keydown', this.onKeydown );

		// Only if we're the last backdrop.
		if ( !$window.document.getElementsByTagName( 'gj-backdrop' ).length ) {
			$window.document.body.classList.remove( 'backdrop-active' );
		}

		delete this.scope;
		delete this.element;
		delete this.boundScope;
		delete this.onKeydown;
		delete this.scopeElement;
	};

	return Backdrop;
} );
