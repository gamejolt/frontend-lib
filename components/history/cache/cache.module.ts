import { NgModule } from 'ng-metadata/core';
import { HistoryCache } from './cache.service';

@NgModule({
	providers: [
		{ provide: 'History_Cache', useFactory: () => HistoryCache },
	],
})
export class HistoryCacheModule { }
