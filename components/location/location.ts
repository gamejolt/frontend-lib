import { provide } from '@angular/core';
import { Location } from './location-service';

export default angular.module( 'gj.Location', [ 'gj.Meta' ] )
.service( ...provide( 'Location', { useClass: Location } ) )
.name;
