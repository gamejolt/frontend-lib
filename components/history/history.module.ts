import { NgModule } from 'ng-metadata/core';
import { History } from './history.service';

@NgModule({
	providers: [
		{ provide: 'History', useFactory: () => History },
	],
})
export class HistoryModule { }
