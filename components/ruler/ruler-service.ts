// Swappable if display is none or starts with table except "table", "table-cell", or "table-caption"
// See here for display values: https://developer.mozilla.org/en-US/docs/CSS/display
const DISPLAY_SWAP_REGEX = /^(none|table(?!-c[ea]).+)/;
const CSS_SHOW_STYLES: any = {
	position: 'absolute',
	visibility: 'hidden',
	display: 'block',
};

export class Ruler
{
	static width( elem: HTMLElement | Document )
	{
		return this.dimensions( 'clientWidth', elem );
	}

	static height( elem: HTMLElement | Document )
	{
		return this.dimensions( 'clientHeight', elem );
	}

	static outerWidth( elem: HTMLElement | Document )
	{
		return this.dimensions( 'offsetWidth', elem );
	}

	static outerHeight( elem: HTMLElement | Document )
	{
		return this.dimensions( 'offsetHeight', elem );
	}

	private static dimensions( baseProp: 'clientWidth' | 'clientHeight' | 'offsetWidth' | 'offsetHeight', _elem: HTMLElement | Document ): number
	{
		let elem: HTMLElement;

		if ( _elem === window.document ) {
			elem = window.document.body;
		}
		else {
			elem = <HTMLElement>_elem;
		}

		const styles = window.getComputedStyle( elem );

		// Certain elements can have dimension info if we invisibly show them,
		// but it must have a current display style that would benefit.
		// This only matters for currently hidden elements that wouldn't return dimensions.
		let swappedStyles = false;
		const oldStyles: any = {};
		if ( DISPLAY_SWAP_REGEX.test( styles.display || '' ) && elem.offsetWidth === 0 ) {
			swappedStyles = true;

			for ( const name in CSS_SHOW_STYLES ) {
				oldStyles[ name ] = (elem.style as any)[ name ];
				(elem.style as any)[ name ] = CSS_SHOW_STYLES[ name ];
			}
		}

		let val = elem[ baseProp ];
		if ( baseProp === 'clientWidth' ) {
			val -= parseFloat( styles.paddingLeft || '' ) + parseFloat( styles.paddingRight || '' );
		}
		else if ( baseProp === 'clientHeight') {
			val -= parseFloat( styles.paddingTop || '' ) + parseFloat( styles.paddingBottom || '' );
		}
		else if ( baseProp === 'offsetWidth' ) {
			val += parseFloat( styles.marginLeft || '' ) + parseFloat( styles.marginRight || '' );
		}
		else if ( baseProp === 'offsetHeight') {
			val += parseFloat( styles.marginTop || '' ) + parseFloat( styles.marginBottom || '' );
		}

		if ( swappedStyles ) {
			for ( const name in CSS_SHOW_STYLES ) {
				(elem.style as any)[ name ] = oldStyles[ name ];
			}
		}

		return val;
	}
}
