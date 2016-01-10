angular.module( 'gj.Form' ).directive( 'inputGroupAddon', function( $rootScope, Screen )
{
	return {
		restrict: 'EA',
		require: '^inputGroup',
		link: function( scope, element, attrs, inputGroup )
		{
			var screenWatcher;

			element.addClass( 'input-group-addon' );

			if ( angular.isDefined( attrs.addonHiddenXs ) ) {

				// We toggle with the sr-only class.
				// This way screen readers can still see it but it effectively removes it as well.
				function checkIsXs()
				{
					if ( Screen.isXs ) {
						inputGroup.isHidden = true;
						element.addClass( 'sr-only' );
					}
					else {
						inputGroup.isHidden = false;
						element.removeClass( 'sr-only' );
					}
				}

				checkIsXs();
				Screen.setResizeSpy( scope, checkIsXs );
			}
		}
	};
} );
