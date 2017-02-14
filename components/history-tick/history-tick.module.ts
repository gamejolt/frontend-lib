import { NgModule } from 'ng-metadata/core';
import { makeProvider } from '../../utils/angular-facade';
import { HistoryTick } from './history-tick-service';

@NgModule({
	providers: [
		makeProvider( 'HistoryTick', HistoryTick ),
	],
})
export class HistoryTickModule { }
