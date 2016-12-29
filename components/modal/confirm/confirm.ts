import { provide } from '@angular/core';
import { ModalConfirm } from './confirm-service';
import { ModalCtrl } from './confirm-controller';

export default angular.module( 'gj.Modal.Confirm', [
	'ui.bootstrap.modal',
] )
.service( ...provide( 'ModalConfirm', { useClass: ModalConfirm } ) )
.controller( ...provide( 'ModalConfirmCtrl', { useClass: ModalCtrl } ) )
.name;
