import { provide } from 'ng-metadata/core';
import { ThumbnailComponent } from './thumbnail-directive';

export default angular.module( 'gj.Comment.Video.Thumbnail', [] )
.directive( ...provide( ThumbnailComponent ) )
.name;
