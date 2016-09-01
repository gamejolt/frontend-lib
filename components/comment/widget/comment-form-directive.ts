export function CommentFormFactory( Form: any, App: any, gettextCatalog: any )
{
	const form = new Form( {
		model: 'Comment',
		template: '/lib/gj-lib-client/components/comment/widget/comment-form.html',

		// We want the comment form to clear out after a comment submission.
		resetOnSubmit: true,
	} );

	form.scope.resource = '@';
	form.scope.resourceId = '<';
	form.scope.parentId = '<?';
	form.scope.gjFormCancelHandler = '&?';

	form.onInit = ( scope: any ) =>
	{
		scope.commentPlaceholder = gettextCatalog.getString( 'Leave a comment...' );
		scope.user = App.user;

		console.log( scope.formModel );

		if ( scope.method == 'add' ) {
			scope.formModel.comment = '';
			scope.formModel.resource = scope.resource;
			scope.formModel.resource_id = scope.resourceId;

			if ( scope.parentId ) {
				scope.formModel.parent_id = scope.parentId;
			}
		}

		scope.onCancel = function()
		{
			if ( scope.gjFormCancelHandler ) {
				scope.gjFormCancelHandler();
			}
		};
	};

	return form;
};
