import { provide } from 'ng-metadata/core';
import { Timezone } from './timezone.service';

export default angular.module( 'gj.Timezone', [] )
.service( ...provide( 'Timezone', { useClass: Timezone } ) )
.name;
