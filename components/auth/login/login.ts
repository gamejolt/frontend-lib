import { provide } from 'ng-metadata/core';
import { AuthLoginComponent } from './login.component';
import { AuthLoginFormFactory } from './login-form.component';

export default angular.module( 'gj.Auth.Login', [] )
.directive( 'gjAuthLoginForm', AuthLoginFormFactory )
.directive( ...provide( AuthLoginComponent ) )
.name;
