import { Comment_VideoFactory } from './video-model';

export default angular.module( 'gj.Comment.Video', [
	'gj.Model',
] )
.factory( 'Comment_Video', Comment_VideoFactory )
.name;
