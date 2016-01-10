angular.module( 'gj.Forum.Post' ).factory( 'Forum_Post', function( Model )
{
	function Forum_Post( data )
	{
		if ( data ) {
			angular.extend( this, data );
		}
	}

	return Model.create( Forum_Post );
} );
