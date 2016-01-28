angular.module( 'gj.Forum.Topic' ).factory( 'Forum_Topic', function( Model )
{
	function Forum_Topic( data )
	{
		if ( data ) {
			angular.extend( this, data );
		}
	}

	return Model.create( Forum_Topic );
} );
