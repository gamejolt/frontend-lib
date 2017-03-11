import { NgModule } from 'ng-metadata/core';
import { Ruler } from './ruler-service';

@NgModule({
	providers: [
		{ provide: 'Ruler', useFactory: () => Ruler },
	],
})
export class RulerModule { }
