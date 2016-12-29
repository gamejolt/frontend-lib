import { provide } from '@angular/core';
import { CardComponent } from './card-directive';

export default angular.module( 'gj.Card', [] )
.directive( ...provide( CardComponent ) )
.name;
