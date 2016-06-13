import { provide } from 'ng-metadata/core';
import { WidgetComponent } from './widget-directive';

export const FiresidePostLikeWidgetModule = angular.module( 'gj.Fireside.Post.Like.Widget', [] )
.directive( ...provide( WidgetComponent ) )
.name
;
