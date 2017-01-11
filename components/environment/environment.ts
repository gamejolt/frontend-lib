import { provide } from 'ng-metadata/core';
import { Environment } from './environment.service';

export default angular.module( 'gj.Environment', [] )
.service( ...provide( 'Environment', { useClass: Environment } ) )
.name;
