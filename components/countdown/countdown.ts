import { provide } from 'ng-metadata/core';
import { CountdownComponent } from './countdown.component';

export default angular.module( 'gj.Countdown', [] )
.directive( ...provide( CountdownComponent ) )
.name;
