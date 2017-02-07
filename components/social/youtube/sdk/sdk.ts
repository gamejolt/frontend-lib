import { provide } from 'ng-metadata/core';
import { YoutubeSdk } from './sdk-service';

export default angular.module( 'gj.Social.Youtube.Sdk', [] )
.service( ...provide( 'Youtube_Sdk', { useClass: YoutubeSdk } ) )
.name;
