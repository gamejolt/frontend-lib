import { provide } from 'ng-metadata/core';
import { Device } from './device-service';

export default angular.module( 'gj.Device', [
] )
.service( ...provide( 'Device', { useClass: Device } ) )
.name;
