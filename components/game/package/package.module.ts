import { NgModule } from 'ng-metadata/core';
import { GamePackage } from './package.model';

@NgModule({
	providers: [
		{ provide: 'Game_Package', useFactory: () => GamePackage }
	],
})
export class GamePackageModule { }
