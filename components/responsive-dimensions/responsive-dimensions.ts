import { provide } from '@angular/core';
import { ResponsiveDimensionsDirective } from './responsive-dimensions-directive';

export default angular.module( 'gj.ResponsiveDimensions', [] )
.directive( ...provide( ResponsiveDimensionsDirective ) )
.name;
