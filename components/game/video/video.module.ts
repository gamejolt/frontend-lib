import { NgModule } from 'ng-metadata/core';
import { GameVideo } from './video.model';

@NgModule({
	providers: [{ provide: 'Game_Video', useFactory: () => GameVideo }],
})
export class GameVideoModule {}
