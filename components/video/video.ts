import { provide } from 'ng-metadata/core';
import { VideoComponent } from './video-directive';

export default angular.module( 'gj.Video', [] )
.directive( ...provide( VideoComponent ) )
.name;
