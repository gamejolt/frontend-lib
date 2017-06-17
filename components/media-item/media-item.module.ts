import { NgModule } from 'ng-metadata/core';
import { MediaItem } from './media-item-model';

@NgModule({
	providers: [{ provide: 'MediaItem', useFactory: () => MediaItem }],
})
export class MediaItemModule {}
