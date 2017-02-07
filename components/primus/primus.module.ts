import { NgModule } from 'ng-metadata/core';
import { Primus } from './primus.service';
import { makeProvider } from '../../utils/angular-facade';

@NgModule({
	providers: [
		makeProvider( 'Primus', Primus ),
	],
})
export class PrimusModule { }
