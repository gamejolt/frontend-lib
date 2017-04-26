import { NgModule } from 'ng-metadata/core';
import { Key } from './key-model';

@NgModule({
	providers: [
		{ provide: 'Key', useFactory: () => Key },
	],
})
export class KeyModule { }
