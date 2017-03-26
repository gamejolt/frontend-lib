import { NgModule } from 'ng-metadata/core';
import { Screen } from './screen-service';

@NgModule({
	providers: [
		{ provide: 'Screen', useFactory: () => Screen },
	],
})
export class ScreenModule { }
