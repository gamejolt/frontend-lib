const KebabCaseRegex = /[A-Z]/g;

export function kebabCase( name: string )
{
	return name.replace( KebabCaseRegex, ( letter, pos ) =>
		(pos ? '-' : '') + letter.toLowerCase() );
}

export function titleCase( str: string )
{
	// Hyphen and underscore.
	str = str.replace( /(\-|_)/g, ' ' );

	// camelCase.
	str = str.replace( /([a-z])([A-Z])/g, '$1 $2' );

	// Uppercase words.
	return str.replace( /\w\S*/g, ( txt ) =>
	{
		return txt.charAt( 0 ).toUpperCase() + txt.substr( 1 ).toLowerCase();
	} );
}

// Pulled from: https://github.com/bevacqua/fuzzysearch
export function fuzzysearch( query: string, text: string )
{
	const tlen = text.length;
	const qlen = query.length;
	if ( qlen > tlen ) {
		return false;
	}
	if ( qlen === tlen && query === text ) {
		return true;
	}
	outer: for ( let i = 0, j = 0; i < qlen; i++ ) {
		const qch = query.charCodeAt( i );
		while ( j < tlen ) {
			if ( text.charCodeAt( j++ ) === qch ) {
				continue outer;
			}
		}
		return false;
	}
	return true;
}
