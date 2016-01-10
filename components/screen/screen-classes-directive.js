angular.module( 'gj.Screen' ).directive( 'gjScreenClasses', function( Screen )
{
	var PREFIX = '__';

	return {
		restrict: 'A',
		link: function( scope, element )
		{
			var currentClasses = [];

			function check()
			{
				var newClasses = [];
				if ( Screen.isXs ) {
					newClasses.push( PREFIX + 'screen-mobile' );
					newClasses.push( PREFIX + 'screen-xs' );
				}
				else if ( Screen.isSm ) {
					newClasses.push( PREFIX + 'screen-mobile' );
					newClasses.push( PREFIX + 'screen-sm-up' );
					newClasses.push( PREFIX + 'screen-sm' );
				}
				else if ( Screen.isMd ) {
					newClasses.push( PREFIX + 'screen-sm-up' );
					newClasses.push( PREFIX + 'screen-desktop' );
					newClasses.push( PREFIX + 'screen-md' );
				}
				else if ( Screen.isLg ) {
					newClasses.push( PREFIX + 'screen-sm-up' );
					newClasses.push( PREFIX + 'screen-desktop' );
					newClasses.push( PREFIX + 'screen-lg' );
				}

				if ( currentClasses.length ) {
					element.removeClass( currentClasses.join( ' ' ) );
				}

				currentClasses = newClasses;
				element.addClass( currentClasses.join( ' ' ) );
			}

			check();
			Screen.setResizeSpy( scope, check );
		}
	};
} );
