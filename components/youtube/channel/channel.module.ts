import { NgModule } from 'ng-metadata/core';
import { YoutubeChannel } from './channel-model';

@NgModule({
	providers: [
		{ provide: 'YoutubeChannel', useFactory: () => YoutubeChannel }
	],
})
export class YoutubeChannelModule { }


