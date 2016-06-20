import { provide } from 'ng-metadata/core';
import { SubscribeComponent } from './subscribe-directive';

export default angular.module( 'gj.Social.Youtube.Subscribe', [] )
.directive( ...provide( SubscribeComponent ) )
.name;
