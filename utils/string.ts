const KebabCaseRegex = /[A-Z]/g;

export function kebabCase( name: string )
{
	return name.replace( KebabCaseRegex, ( letter, pos ) =>
		(pos ? '-' : '') + letter.toLowerCase() );
}
