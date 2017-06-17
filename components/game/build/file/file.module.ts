import { NgModule } from 'ng-metadata/core';
import { GameBuildFile } from './file.model';

@NgModule({
	providers: [{ provide: 'Game_Build_File', useFactory: () => GameBuildFile }],
})
export class GameBuildFileModule {}
