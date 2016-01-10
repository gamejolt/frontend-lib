angular.module( 'gj.Comment.Widget' ).directive( 'gjCommentWidgetAddForm', function( App, Form, Comment )
{
	var form = new Form( {
		model: 'Comment',
		template: '/lib/gj-lib-client/components/comment/widget/add-form.html',

		// We want the comment form to clear out after a comment submission.
		resetOnSubmit: true
	} );

	form.scope.resource = '@commentResource';
	form.scope.resourceId = '=commentResourceId';
	form.scope.parentId = '=?commentParentId';

	form.onInit = function( scope )
	{
		scope.user = App.user;

		scope.formModel.comment = '';
		scope.formModel.resource = scope.resource;
		scope.formModel.resource_id = scope.resourceId;

		if ( scope.parentId ) {
			scope.formModel.parent_id = scope.parentId;
		}
	};

	return form;
} );
