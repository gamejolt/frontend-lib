import { provide } from '@angular/core';
import { Screen } from './screen-service';

export default angular.module( 'gj.Screen', [] )
.service( ...provide( 'Screen', { useClass: Screen } ) )
.name;
