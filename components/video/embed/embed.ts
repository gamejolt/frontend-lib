import { provide } from 'ng-metadata/core';
import { VideoEmbedComponent } from './embed-directive';

export default angular.module( 'gj.Video.Embed', [] )
.directive( ...provide( VideoEmbedComponent ) )
.name;
