import { Comment_VoteFactory } from './vote-model';

export default angular.module( 'gj.Comment.Vote', [
	'gj.Model',
] )
.factory( 'Comment_Vote', Comment_VoteFactory )
.name;
