import { provide } from '@angular/core';
import { LightboxComponent } from './lightbox-directive';

export default angular.module( 'gj.Comment.Video.Lightbox', [] )
.directive( ...provide( LightboxComponent ) )
.name;
