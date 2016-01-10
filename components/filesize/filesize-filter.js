angular.module( 'gj.Filesize' ).filter( 'filesize', function( numberFilter )
{
	var units = [
		'bytes',
		'KB',
		'MB',
		'GB',
		'TB',
		'PB'
	];

	return function( bytes, precision )
	{
		if ( isNaN( parseFloat( bytes ) ) || !isFinite( bytes ) ) {
			return '?';
		}
		else if ( bytes < 1024 ) {
			return bytes + ' ' + units[0];
		}

		var unit = 0;

		while ( bytes >= 1024 ) {
			bytes /= 1024;
			++unit;
		}

		return numberFilter( bytes.toFixed( precision ) ) + ' ' + units[unit];
	};
} );
