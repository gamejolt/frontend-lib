angular.module( 'gj.Form.MarkdownEditor' ).directive( 'formMarkdownEditorMediaItems', function( Form, Api, MediaItem, Clipboard )
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
					scope.maxFilesize = response.maxFilesize;
					scope.maxWidth = response.maxWidth;
					scope.maxHeight = response.maxHeight;
				} );
		}

		scope.copyLink = function( mediaItem )
		{
			Clipboard.copy( '![](' + mediaItem.img_url.replace( / /g, '+' ) + ')' );
		};
	};

	form.onSubmit = function( scope )
	{
		return Api.sendRequest( '/web/dash/media-items/add', scope.formModel, { file: scope.formModel.file } )
			.then( function( response )
			{
				var i;
				if ( response.success !== false && angular.isArray( response.mediaItems ) ) {
					for ( var i = 0; i < response.mediaItems.length; ++i ) {
						scope.mediaItems.unshift( new MediaItem( response.mediaItems[ i ] ) );
					}
				}

				return response;
			} );
	};

	return form;
} );
