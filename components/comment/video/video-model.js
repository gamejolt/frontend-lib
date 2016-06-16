angular.module( 'gj.Comment.Video' ).factory( 'Comment_Video', function( $injector, Model, Api, Game )
{
	function Comment_Video( data )
	{
		if ( data ) {
			angular.extend( this, data );

			if ( data.comment ) {
				var Comment = $injector.get( 'Comment' );
				this.comment = new Comment( data.comment );
			}

			if ( data.game ) {
				this.game = new Game( data.game );
			}
		}
	}

	return Model.create( Comment_Video );
} );
