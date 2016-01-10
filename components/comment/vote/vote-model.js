angular.module( 'gj.Comment.Vote' ).factory( 'Comment_Vote', function( Model, Api )
{
	function Comment_Vote( data )
	{
		if ( data ) {
			angular.extend( this, data );
		}
	}

	Comment_Vote.prototype.$save = function()
	{
		return this.$_save( '/comments/votes/add/' + this.comment_id, 'commentVote', { ignorePayloadUser: true } );
	};

	Comment_Vote.prototype.$remove = function()
	{
		return this.$_remove( '/comments/votes/remove/' + this.id, { ignorePayloadUser: true } );
	};

	return Model.create( Comment_Vote );
} );
