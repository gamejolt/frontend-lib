import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./add-form.html?style=./add-form.styl';

import { BaseForm } from '../../form-vue/form.service';
import { State } from 'vuex-class';
import { AppState } from '../../../vue/services/app/app-store';
import { Comment } from '../comment-model';
import { AppUserAvatar } from '../../user/user-avatar/user-avatar';
import { AppFormControlMarkdown } from '../../form-vue/control/markdown/markdown';

@View
@Component({
	components: {
		AppFormControlMarkdown,
		AppUserAvatar,
	}
})
export class AppCommentWidgetAddForm extends BaseForm<Comment>
{
	@Prop( String ) resource: string;
	@Prop( Number ) resourceId: number;
	@Prop( Number ) parentId?: number;

	@State app: AppState;

	modelClass = Comment;

	// We want the comment form to clear out after a comment submission.
	resetOnSubmit = true;

	created()
	{

		this.formModel.comment = '';
		this.formModel.resource = this.resource;
		this.formModel.resource_id = this.resourceId;

		if ( this.parentId ) {
			this.formModel.parent_id = this.parentId;
		}
	}
}


// angular.module( 'gj.Comment.Widget' ).directive( 'gjCommentWidgetAddForm', function( App, Form, Comment, gettextCatalog )
// {
// 	var form = new Form( {
// 		model: 'Comment',
// 		template: require( './add-form.html' ),

// 		// We want the comment form to clear out after a comment submission.
// 		resetOnSubmit: true
// 	} );

// 	form.scope.resource = '@commentResource';
// 	form.scope.resourceId = '=commentResourceId';
// 	form.scope.parentId = '=?commentParentId';

// 	form.onInit = function( scope )
// 	{
// 		scope.commentPlaceholder = gettextCatalog.getString( 'Leave a comment...' );
// 		scope.user = App.user;

// 		scope.formModel.comment = '';
// 		scope.formModel.resource = scope.resource;
// 		scope.formModel.resource_id = scope.resourceId;

// 		if ( scope.parentId ) {
// 			scope.formModel.parent_id = scope.parentId;
// 		}
// 	};

// 	return form;
// } );
