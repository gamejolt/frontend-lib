// import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./add-form.html?style=./add-form.styl';

import { BaseForm } from '../../form-vue/form.service';
import { FormCommonComponents } from '../../form-vue/form';
import { State } from 'vuex-class';
import { AppState } from '../../../vue/services/app/app-store';
import { Comment } from '../comment-model';
import { AppUserAvatar } from '../../user/user-avatar/user-avatar';

@View
@Component({
	components: {
		...FormCommonComponents,
		AppUserAvatar,
	}
})
export class AppCommentWidgetAddForm extends BaseForm
{
	@Prop( String ) resource: string;
	@Prop( Number ) resourceId: number;
	@Prop( Number ) parentId?: number;

	@State app: AppState;

	formModel: Comment;

	created()
	{
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
