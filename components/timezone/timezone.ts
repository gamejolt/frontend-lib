import { provide } from 'ng-metadata/core';
import { Timezone } from './timezone.service';

export default angular.module( 'gj.Timezone', [ 'gj.Api' ] )
.service( ...provide( 'Timezone', { useClass: Timezone } ) )
.name;
