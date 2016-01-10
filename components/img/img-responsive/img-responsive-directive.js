angular.module( 'gj.Img.ImgResponsive' ).directive( 'gjImgResponsive', function( $rootScope, $timeout, $parse, Screen, Ruler, ImgHelper )
{
	var WIDTH_HEIGHT_REGEX = /\/(\d+)x(\d+)\//;
	var WIDTH_REGEX = /\/(\d+)\//;

	function updateSrc( element, startSrc, currentSrc, maxWidth, scope )
	{
		var width = Ruler.width( element[0].parentNode );

		// Make sure we never do a 0 width, just in case.
		// Seems to happen in some situations.
		if ( width <= 0 ) {
			return;
		}

		// We keep width within 100px increment bounds.
		if ( Screen.isHiDpi ) {

			// For high dpi, double the width.
			width = width * 2;
			width = Math.ceil( width / 100 ) * 100;
		}
		else {
			width = Math.ceil( width / 100 ) * 100;
		}

		if ( maxWidth !== false && width > maxWidth ) {
			width = maxWidth;
		}

		// Update width in the URL.
		var newSrc;
		if ( startSrc.search( WIDTH_HEIGHT_REGEX ) !== -1 ) {
			newSrc = startSrc.replace( WIDTH_HEIGHT_REGEX, '/' + width + 'x2000/' );
		}
		else {
			newSrc = startSrc.replace( WIDTH_REGEX, '/' + width + '/' );
		}

		// Only if the src changed from previous runs.
		// They may be the same if the user resized the window but image container didn't change dimensions.
		if ( newSrc != currentSrc ) {
			element.attr( 'src', newSrc );

			// Keep the isLoaded state up to date?
			if ( scope && angular.isDefined( scope.isLoaded ) ) {
				scope.isLoaded = false;
				ImgHelper.loaded( newSrc ).then( function()
				{
					scope.isLoaded = true;
				} );
			}
		}

		return newSrc;
	}

	return {
		restrict: 'A',
		scope: {
			isLoaded: '=?isLoaded',
		},
		compile: function( element )
		{
			// Add the img-responsive class so that it fills the container that it's wrapped in.
			element.addClass( 'img-responsive' );

			return function( scope, element, attrs )
			{
				var startSrc, currentSrc;
				var maxWidth = false;

				if ( attrs.gjImgResponsiveMaxWidth ) {
					maxWidth = $parse( attrs.gjImgResponsiveMaxWidth )( scope );
				}

				attrs.$observe( 'gjImgResponsive', function( newSrc )
				{
					startSrc = newSrc;
					scope.$applyAsync( function()
					{
						currentSrc = updateSrc( element, startSrc, currentSrc, maxWidth, scope );
					} );
				} );

				Screen.setResizeSpy( scope, function()
				{
					scope.$applyAsync( function()
					{
						currentSrc = updateSrc( element, startSrc, currentSrc, maxWidth, scope );
					} );
				} );
			}
		}
	};
} );
