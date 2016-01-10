angular.module( 'gj.Fireside.Post.Like' ).factory( 'Fireside_Post_Like', function( Model, Api, User )
{
	function Fireside_Post_Like( data )
	{
		if ( data ) {
			angular.extend( this, data );

			if ( data.user ) {
				this.user = new User( data.user );
			}
		}
	}

	Fireside_Post_Like.prototype.$save = function()
	{
		if ( !this.id ) {
			return this.$_save( '/fireside/posts/like/' + this.fireside_post_id, 'firesidePostLike', { ignorePayloadUser: true } );
		}
	};

	Fireside_Post_Like.prototype.$remove = function()
	{
		return this.$_remove( '/fireside/posts/unlike/' + this.fireside_post_id, { ignorePayloadUser: true } );
	};

	return Model.create( Fireside_Post_Like );
} );
