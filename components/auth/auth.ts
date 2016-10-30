import { provide } from 'ng-metadata/core';
import { AuthModal } from './auth-modal.service';
import { AuthModalComponent } from './auth-modal.component';
import { AuthRequiredDirective } from './auth-required.directive';
import { AuthModalCtrl } from './auth-modal.controller';

export default angular.module( 'gj.Auth', [] )
.controller( 'AuthModalCtrl', AuthModalCtrl )
.directive( ...provide( AuthModalComponent ) )
.directive( ...provide( AuthRequiredDirective ) )
.service( ...provide( 'AuthModal', { useClass: AuthModal } ) )
.name;
