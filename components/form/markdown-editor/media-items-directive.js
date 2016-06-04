angular.module( 'gj.Form.MarkdownEditor' ).directive( 'formMarkdownEditorMediaItems', function( Form, Api, MediaItem, Permalink )
{
	var form = new Form( {
		// model: 'Fireside_Post',
		template: '/lib/gj-lib-client/components/form/markdown-editor/media-items.html',
	} );

	form.scope.type = '@type';
	form.scope.parentId = '=parentId';

	form.onInit = function( scope )
	{
		scope.formState.isLoaded = false;

		Api.sendRequest( '/web/dash/media-items/' + scope.type + '/' + scope.parentId, null, { detach: true } )
			.then( function( response )
			{
				scope.formState.isLoaded = true;
				scope.mediaItems = MediaItem.populate( response.mediaItems );
			} );

		scope.copyLink = function( mediaItem )
		{
			Permalink.copy( '![](' + mediaItem.img_url.replace( / /g, '+' ) + ')' );
		};
	};

	return form;
} );
