export function arrayUnique( values: any[] )
{
	return values.filter( ( value, index ) =>
	{
		return values.indexOf( value ) === index;
	} );
}

export function stringSort( a: string, b: string )
{
	a = a.toLowerCase();
	b = b.toLowerCase();

	if ( a < b ) {
		return -1;
	}
	else if ( a > b ) {
		return 1;
	}
	return 0;
}
