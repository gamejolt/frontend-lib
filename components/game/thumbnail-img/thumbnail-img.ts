import { provide } from 'ng-metadata/core';
import { ThumbnailImgComponent } from './thumbnail-img-directive';

export default angular.module( 'gj.Game.ThumbnailImg', [] )
.directive( ...provide( ThumbnailImgComponent ) )
.name;
