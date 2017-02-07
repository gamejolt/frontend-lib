import { NgModule } from 'ng-metadata/core';
import { makeProvider } from '../../utils/angular-facade';
import { Analytics } from './analytics.service';
import { TrackEventDirective } from './track-event.directive';

@NgModule({
	declarations: [
		TrackEventDirective,
	],
	providers: [
		makeProvider( 'Analytics', Analytics ),
	],
})
export class AnalyticsModule { }
