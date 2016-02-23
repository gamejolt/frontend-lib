angular.module( 'gj.Lazy.Placeholder' ).directive( 'gjLazyPlaceholder', function( $parse )
{
	return {
		restrict: 'A',
		transclude: true,
		scope: {},
		template: '<ng-transclude></ng-transclude>',
		link: {
			post: function( scope, element, attrs )
			{
				var elem = element[0];
				elem.classList.add( 'lazy-placeholder-resolving' );

				var watch = scope.$watch( function()
				{
					return $parse( attrs.gjLazyPlaceholder )( scope.$parent );
				},
				function( val )
				{
					if ( val ) {
						watch();  // Deregister.
						elem.classList.remove( 'lazy-placeholder-resolving' )
						elem.classList.add( 'lazy-placeholder-resolved' );

						// Remove all placeholders from DOM.
						var placeholders = elem.querySelectorAll( '.lazy-placeholder' );
						for ( var i = 0; i < placeholders.length; ++i ) {
							var _elem = placeholders[ i ];
							_elem.parentNode.removeChild( _elem );
						}
					}
				} );
			}
		}
	};
} );
