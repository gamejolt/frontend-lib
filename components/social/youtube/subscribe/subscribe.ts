import { provide } from '@angular/core';
import { SubscribeComponent } from './subscribe-directive';

export default angular.module( 'gj.Social.Youtube.Subscribe', [] )
.directive( ...provide( SubscribeComponent ) )
.name;
