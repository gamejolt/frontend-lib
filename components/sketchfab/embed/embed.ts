import { provide } from 'ng-metadata/core';
import { SketchfabEmbedComponent } from './embed.component';

export default angular.module( 'gj.Sketchfab.Embed', [] )
.directive( ...provide( SketchfabEmbedComponent ) )
.name;
