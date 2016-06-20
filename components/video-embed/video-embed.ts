import { provide } from 'ng-metadata/core';
import { VideoEmbedComponent } from './video-embed-directive';

export default angular.module( 'gj.VideoEmbed', [] )
.directive( ...provide( VideoEmbedComponent ) )
.name;
