import { provide } from '@angular/core';
import { ThumbnailImgComponent } from './thumbnail-img-directive';

export default angular.module( 'gj.Game.ThumbnailImg', [] )
.directive( ...provide( ThumbnailImgComponent ) )
.name;
