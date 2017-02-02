import { provide } from 'ng-metadata/core';
import { Connection } from './connection-service';

export default angular.module( 'gj.Connection', [] )
.service( ...provide( 'Connection', { useClass: Connection } ) )
.name;
