const KebabCaseRegex = /[A-Z]/g;

export function kebabCase( name: string )
{
	return name.replace( KebabCaseRegex, ( letter, pos ) =>
		(pos ? '-' : '') + letter.toLowerCase() );
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
