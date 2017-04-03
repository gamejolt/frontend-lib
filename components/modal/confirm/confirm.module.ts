import { NgModule } from 'ng-metadata/core';
import { ModalConfirm } from './confirm-service';

@NgModule({
	providers: [
		{ provide: 'ModalConfirm', useFactory: () => ModalConfirm },
	],
})
export class ModalConfirmModule { }
