angular.module( 'gj.Comment' ).factory( 'Comment', function( Model, Api, User )
{
	function Comment( data )
	{
		if ( data ) {
			angular.extend( this, data );

			if ( data.user ) {
				this.user = new User( data.user );
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

	Comment.getCommentUrl = function( commentId)
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

	return Model.create( Comment );
} );
