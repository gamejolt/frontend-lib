import { provide } from 'ng-metadata/core';
import { Meta } from './meta-service';

export default angular.module( 'gj.Meta', [] )
.service( ...provide( 'Meta', { useClass: Meta } ) )
.name;
