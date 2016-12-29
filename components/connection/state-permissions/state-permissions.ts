import { provide } from '@angular/core';
import { ConnectionStatePermissions } from './state-permissions-service';

export default angular.module( 'gj.Connection.StatePermissions', [] )
.service( ...provide( 'ConnectionStatePermissions', { useClass: ConnectionStatePermissions } ) )
.name;
