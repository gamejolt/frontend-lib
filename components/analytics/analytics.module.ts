import { NgModule } from 'ng-metadata/core';
import { Analytics } from './analytics.service';
import { TrackEventDirective } from './track-event.directive';

@NgModule({
	declarations: [
		TrackEventDirective,
	],
	providers: [
		{ provide: 'Analytics', useFactory: () => Analytics },
	],
})
export class AnalyticsModule { }
