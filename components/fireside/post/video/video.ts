import { Fireside_Post_VideoFactory } from './video-model';

export default angular.module( 'gj.Fireside.Post.Video', [
	'gj.Model'
] )
.factory( 'Fireside_Post_Video', Fireside_Post_VideoFactory )
.name;
