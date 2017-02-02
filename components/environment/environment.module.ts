import { NgModule } from 'ng-metadata/core';
import { Environment } from './environment.service';
import { makeProvider } from '../../utils/angular-facade';

@NgModule({
	providers: [
		makeProvider( 'Environment', Environment ),
	],
})
export class EnvironmentModule { }
