import { CommentFactory } from './comment-model';

export default angular.module( 'gj.Comment', [
	'gj.Model',
] )
.factory( 'Comment', CommentFactory )
.name;
