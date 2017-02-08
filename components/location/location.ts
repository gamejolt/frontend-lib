import { provide } from 'ng-metadata/core';
import { Location } from './location-service';

export default angular.module( 'gj.Location', [] )
.service( ...provide( 'Location', { useClass: Location } ) )
.name;
