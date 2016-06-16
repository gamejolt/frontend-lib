angular.module( 'gj.Comment.Video' ).factory( 'Comment_Video', function( Model, Api )
{
	function Comment_Video( data )
	{
		if ( data ) {
			angular.extend( this, data );
		}
	}

	return Model.create( Comment_Video );
} );
