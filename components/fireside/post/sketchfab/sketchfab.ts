import { Fireside_Post_SketchfabFactory } from './sketchfab-model';

export default angular.module( 'gj.Fireside.Post.Sketchfab', [
	'gj.Model'
] )
.factory( 'Fireside_Post_Sketchfab', Fireside_Post_SketchfabFactory )
.name;
