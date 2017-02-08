import { NgModule } from 'ng-metadata/core';
import { YoutubeChannel } from './channel-model';

@NgModule({
	providers: [
		{ provide: 'Youtube_Channel', useFactory: () => YoutubeChannel }
	],
})
export class YoutubeChannelModule { }


