import { provide } from '@angular/core';
import { AuthJoinComponent } from './join.component';
import { AuthJoinFormFactory } from './join-form.component';

export default angular.module( 'gj.Auth.Join', [] )
.directive( 'gjAuthJoinForm', AuthJoinFormFactory )
.directive( ...provide( AuthJoinComponent ) )
.name;
