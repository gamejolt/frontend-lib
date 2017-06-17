import { NgModule } from 'ng-metadata/core';
import { GameDataStoreItem } from './item.model';

@NgModule({
	providers: [
		{ provide: 'Game_DataStore_Item', useFactory: () => GameDataStoreItem },
	],
})
export class GameDataStoreItemModule {}
