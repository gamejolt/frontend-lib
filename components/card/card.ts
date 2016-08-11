import { provide } from 'ng-metadata/core';
import { CardComponent } from './card-directive';

export default angular.module( 'gj.Card', [] )
.directive( ...provide( CardComponent ) )
.name;
