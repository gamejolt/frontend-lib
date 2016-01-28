angular.module( 'gj.Forum.Category' ).factory( 'Forum_Category', function( Model )
{
	function Forum_Category( data )
	{
		if ( data ) {
			angular.extend( this, data );
		}
	}

	return Model.create( Forum_Category );
} );
