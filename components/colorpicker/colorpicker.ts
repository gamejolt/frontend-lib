import { provide } from 'ng-metadata/core';
import { ColorpickerDirective } from './colorpicker.directive';

export default angular.module( 'gj.Colorpicker', [] )
.directive( ...provide( ColorpickerDirective ) )
.name;
