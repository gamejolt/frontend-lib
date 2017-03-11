import { NgModule } from 'ng-metadata/core';
import { HistoryTick } from './history-tick-service';

@NgModule({
	providers: [
		{ provide: 'HistoryTick', useFactory: () => HistoryTick },
	],
})
export class HistoryTickModule { }
