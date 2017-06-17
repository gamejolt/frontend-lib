import { NgModule } from 'ng-metadata/core';
import { GameBuildLaunchOption } from './launch-option.model';

@NgModule({
	providers: [
		{
			provide: 'Game_Build_LaunchOption',
			useFactory: () => GameBuildLaunchOption,
		},
	],
})
export class GameBuildLaunchOptionModule {}
