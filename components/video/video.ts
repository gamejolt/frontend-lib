import { provide } from '@angular/core';
import { VideoComponent } from './video-directive';

export default angular.module( 'gj.Video', [] )
.directive( ...provide( VideoComponent ) )
.name;
