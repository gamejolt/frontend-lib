angular.module( 'gj.Comment' ).factory( 'Comment', function( Model, Api, User, Comment_Video, Comment_Vote )
{
	function Comment( data )
	{
		if ( data ) {
			angular.extend( this, data );

			if ( data.user ) {
				this.user = new User( data.user );
			}

			if ( data.videos ) {
				this.videos = Comment_Video.populate( data.videos );
			}

			if ( data.userVote ) {
				this.userVote = new Comment_Vote( data.userVote );
			}
		}
	}

	Comment.STATUS_REMOVED = 0;
	Comment.STATUS_VISIBLE = 1;
	Comment.STATUS_SPAM = 2;

	Comment.fetch = function( resource, resourceId, page )
	{
		var query = '';
		if ( page ) {
			query = '?page=' + page;
		}

		return Api.sendRequest( '/comments/' + resource + '/' + resourceId + query, null, { detach: true } );
	};

	Comment.getCommentPage = function( commentId )
	{
		return Api.sendRequest( '/comments/get-comment-page/' + commentId, null, { detach: true } ).then( function( response )
		{
			if ( !response || response.error ) {
				return $q.reject( response.error );
			}

			return response.page;
		} );
	};

	Comment.getCommentUrl = function( commentId )
	{
		return Api.sendRequest( '/comments/get-comment-url/' + commentId, null, { detach: true } ).then( function( response )
		{
			if ( !response || response.error ) {
				return $q.reject( response.error );
			}

			return response.url;
		} );
	};

	Comment.prototype.$save = function()
	{
		return this.$_save( '/comments/add/' + this.resource + '/' + this.resource_id, 'comment', { detach: true } );
	};

	Comment.prototype.$like = function()
	{
		if ( this.isVotePending ) {
			return;
		}
		this.isVotePending = true;

		var newVote = new Comment_Vote( { comment_id: this.id } );

		var _this = this;
		newVote.$save()
			.then( function()
			{
				_this.userVote = newVote;
				++_this.votes;
				_this.isVotePending = false;
			} );
	};

	Comment.prototype.$removeLike = function()
	{
		if ( !this.userVote || this.isVotePending ) {
			return;
		}
		this.isVotePending = true;

		var _this = this;
		this.userVote.$remove()
			.then( function()
			{
				_this.userVote = null;
				--_this.votes;
				_this.isVotePending = false;
			} );
	};

	return Model.create( Comment );
} );
