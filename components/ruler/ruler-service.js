angular.module( 'gj.Ruler' ).service( 'Ruler', function( $window )
{
	// Swappable if display is none or starts with table except "table", "table-cell", or "table-caption"
	// See here for display values: https://developer.mozilla.org/en-US/docs/CSS/display
	var DISPLAY_SWAP_REGEX = /^(none|table(?!-c[ea]).+)/;
	var CSS_SHOW_STYLES = {
		position: 'absolute',
		visibility: 'hidden',
		display: 'block',
	};

	angular.forEach( { width: 'clientWidth', height: 'clientHeight', outerWidth: 'offsetWidth', outerHeight: 'offsetHeight' }, function( baseProp, prop )
	{
		this[ prop ] = function( elem )
		{
			if ( elem === $window.document ) {
				elem = $window.document.body;
			}

			var styles = $window.getComputedStyle( elem );

			// Certain elements can have dimension info if we invisibly show them,
			// but it must have a current display style that would benefit.
			// This only matters for currently hidden elements that wouldn't return dimensions.
			var swappedStyles = false;
			if ( DISPLAY_SWAP_REGEX.test( styles.display ) && elem.offsetWidth === 0 ) {
				var oldStyles = {};
				var name;

				swappedStyles = true;
				for ( name in CSS_SHOW_STYLES ) {
					oldStyles[ name ] = elem.style[ name ];
					elem.style[ name ] = CSS_SHOW_STYLES[ name ];
				}
			}

			var val = elem[ baseProp ];
			if ( prop === 'width' ) {
				val -= parseFloat( styles.paddingLeft ) + parseFloat( styles.paddingRight );
			}
			else if ( prop === 'height') {
				val -= parseFloat( styles.paddingTop ) + parseFloat( styles.paddingBottom );
			}
			else if ( prop === 'outerWidth' ) {
				val += parseFloat( styles.marginLeft ) + parseFloat( styles.marginRight );
			}
			else if ( prop === 'outerHeight') {
				val += parseFloat( styles.marginTop ) + parseFloat( styles.marginBottom );
			}

			if ( swappedStyles ) {
				for ( name in CSS_SHOW_STYLES ) {
					elem.style[ name ] = oldStyles[ name ];
				}
			}

			return val;
		};
	}, this );
} );
