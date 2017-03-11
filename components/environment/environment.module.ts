import { NgModule } from 'ng-metadata/core';
import { Environment } from './environment.service';

@NgModule({
	providers: [
		{ provide: 'Environment', useFactory: () => Environment },
	],
})
export class EnvironmentModule { }
