import { provide } from '@angular/core';
import { ConnectionReconnectFactory } from './reconnect-service';
import { Connection } from './connection-service';

export default angular.module( 'gj.Connection', [] )
.factory( 'ConnectionReconnect', ConnectionReconnectFactory )
.service( ...provide( 'Connection', { useClass: Connection } ) )
.name;
