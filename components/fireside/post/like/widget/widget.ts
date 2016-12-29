import { provide } from '@angular/core';
import { WidgetComponent } from './widget-directive';

export default angular.module( 'gj.Fireside.Post.Like.Widget', [] )
.directive( ...provide( WidgetComponent ) )
.name;
