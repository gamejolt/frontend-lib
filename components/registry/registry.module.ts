import { NgModule } from 'ng-metadata/core';
import { makeProvider } from '../../utils/angular-facade';
import { Registry } from './registry.service';

@NgModule({
	providers: [
		makeProvider( 'Registry', Registry ),
	],
})
export class RegistryModule { }
