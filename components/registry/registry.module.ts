import { NgModule } from 'ng-metadata/core';
import { Registry } from './registry.service';

@NgModule({
	providers: [
		{ provide: 'Registry', useFactory: () => Registry },
	],
})
export class RegistryModule { }
