import { Fireside_Post_TagFactory } from './tag-model';

export default angular.module( 'gj.Fireside.Post.Tag', [
	'gj.Model'
] )
.factory( 'Fireside_Post_Tag', Fireside_Post_TagFactory )
.name;
