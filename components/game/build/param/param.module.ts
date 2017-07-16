import { NgModule } from 'ng-metadata/core';
import { GameBuildParam } from './param.model';

@NgModule({
	providers: [{ provide: 'Game_Build_Param', useFactory: () => GameBuildParam }],
})
export class GameBuildParamModule {}
