export function arrayUnique( values: any[] )
{
	return values.filter( ( value, index ) =>
	{
		return values.indexOf( value ) === index;
	} );
}
