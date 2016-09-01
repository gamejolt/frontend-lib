import { provide } from 'ng-metadata/core';
import { WidgetComponent } from './widget-directive';
import { CommentComponent } from './comment-directive';
import { CommentFormFactory } from './comment-form-directive';

export default angular.module( 'gj.Comment.Widget', [
	'gj.Comment',
	'gj.Comment.Vote',
	'gj.Subscription',
	'gj.Pagination',
	'gj.Form.MarkdownEditor',
	'gj.FadeCollapse',
	'gj.Translation',
	'gj.Translate',
	'gj.Report.Modal',
] )
.directive( 'gjCommentWidgetCommentForm', CommentFormFactory )
.directive( ...provide( WidgetComponent ) )
.directive( ...provide( CommentComponent ) )
.name;
