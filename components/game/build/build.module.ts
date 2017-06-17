import { NgModule } from 'ng-metadata/core';
import { GameBuild } from './build.model';

@NgModule({
	providers: [{ provide: 'Game_Build', useFactory: () => GameBuild }],
})
export class GameBuildModule {}
