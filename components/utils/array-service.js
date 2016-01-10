angular.module( 'gj.Utils' ).service( 'ArrayUtils', function()
{
	this.chunk = function( array, chunkSize )
	{
		var chunkedArray = [];
		var arrayLength = array.length;

		if ( !chunkSize || chunkSize < 0 ) {
			return array;
		}

		if ( !array || !angular.isArray( array ) ) {
			return array;
		}

		if ( arrayLength ) {
			for ( var i = 0; i < arrayLength; i += chunkSize ) {
				chunkedArray.push( array.slice( i, i + chunkSize ) );
			}
		}

		return chunkedArray;
	};
} );
