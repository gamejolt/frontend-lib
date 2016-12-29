import { provide } from '@angular/core';
import { AuthModal } from './auth-modal.service';
import { AuthRequiredDirective } from './auth-required.directive';
import { AuthModalCtrl } from './auth-modal.controller';

export default angular.module( 'gj.Auth', [] )
.controller( 'AuthModalCtrl', AuthModalCtrl )
.service( ...provide( 'AuthModal', { useClass: AuthModal } ) )
.directive( ...provide( AuthRequiredDirective ) )
.name;
