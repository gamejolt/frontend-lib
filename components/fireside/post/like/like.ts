import { Fireside_Post_LikeFactory } from './like-model';

export default angular.module( 'gj.Fireside.Post.Like', [
	'gj.Model'
] )
.factory( 'Fireside_Post_Like', Fireside_Post_LikeFactory )
.name;
