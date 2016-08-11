import { provide } from 'ng-metadata/core';
import { WidgetComponent } from './widget-directive';

export default angular.module( 'gj.Fireside.Post.Like.Widget', [] )
.directive( ...provide( WidgetComponent ) )
.name;
