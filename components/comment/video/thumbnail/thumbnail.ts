import { provide } from '@angular/core';
import { ThumbnailComponent } from './thumbnail-directive';

export default angular.module( 'gj.Comment.Video.Thumbnail', [] )
.directive( ...provide( ThumbnailComponent ) )
.name;
