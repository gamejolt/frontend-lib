angular.module( 'gj.Form.MarkdownEditor' ).directive( 'formMarkdownEditorMediaItems', function( Form, Api, MediaItem, Permalink )
{
	var form = new Form( {
		template: '/lib/gj-lib-client/components/form/markdown-editor/media-items.html',
		resetOnSubmit: true,
	} );

	form.scope.type = '@';
	form.scope.parentId = '<';

	form.onInit = function( scope )
	{
		scope.formState.isLoaded = false;
		scope.formModel.type = scope.type;
		scope.formModel.parent_id = scope.parentId;

		if ( !scope.formState.isLoaded ) {
			Api.sendRequest( '/web/dash/media-items', scope.formModel, { detach: true } )
				.then( function( response )
				{
					scope.formState.isLoaded = true;
					scope.mediaItems = MediaItem.populate( response.mediaItems );
				} );
		}

		scope.copyLink = function( mediaItem )
		{
			Permalink.copy( '![](' + mediaItem.img_url.replace( / /g, '+' ) + ')' );
		};
	};

	form.onSubmit = function( scope )
	{
		return Api.sendRequest( '/web/dash/media-items/add', scope.formModel, { file: scope.formModel.file } )
			.then( function( response )
			{
				if ( response.success !== false ) {
					scope.mediaItems.unshift( new MediaItem( response.mediaItem ) );
				}

				return response;
			} );
	};

	return form;
} );
