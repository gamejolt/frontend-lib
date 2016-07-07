import { provide } from 'ng-metadata/core';
import { Permalink } from './permalink-service';

export default angular.module( 'gj.Permalink', [ 'gj.Growls' ] )
.service( ...provide( 'Permalink', { useClass: Permalink } ) )
.name;
