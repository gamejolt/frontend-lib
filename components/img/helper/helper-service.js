angular.module( 'gj.Img.Helper' ).service( 'ImgHelper', function( $document, $q )
{
	this.loaded = function( url )
	{
		return new $q( function( resolve, reject )
		{
			var img = $document[0].createElement( 'img' );
			img.onload = resolve;
			img.onerror = reject;
			img.src = url;
		} );
	};
} );
