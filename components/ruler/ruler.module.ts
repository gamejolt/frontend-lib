import { NgModule } from 'ng-metadata/core';
import { makeProvider } from '../../utils/angular-facade';
import { Ruler } from './ruler-service';

@NgModule({
	providers: [
		makeProvider( 'Ruler', Ruler ),
	],
})
export class RulerModule { }
