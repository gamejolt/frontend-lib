angular.module( 'gj.Forum.Channel' ).factory( 'Forum_Channel', function( Model )
{
	function Forum_Channel( data )
	{
		if ( data ) {
			angular.extend( this, data );
		}
	}

	return Model.create( Forum_Channel );
} );
