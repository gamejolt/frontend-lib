import { provide } from 'ng-metadata/core';
import { Screen } from './screen-service';

export default angular.module( 'gj.Screen', [] )
.service( ...provide( 'Screen', { useClass: Screen } ) )
.name;

import './screen-classes-directive';
import './screen-context-directive';
