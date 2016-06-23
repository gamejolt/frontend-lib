import { provide } from 'ng-metadata/core';
import { LightboxComponent } from './lightbox-directive';

export default angular.module( 'gj.Comment.Video.Lightbox', [] )
.directive( ...provide( LightboxComponent ) )
.name;
