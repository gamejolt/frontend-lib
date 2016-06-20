import { provide } from 'ng-metadata/core';
import { Youtube_Sdk } from './sdk-service';

export default angular.module( 'gj.Social.Youtube.Sdk', [] )
.service( ...provide( 'Youtube_Sdk', { useClass: Youtube_Sdk } ) )
.name;
