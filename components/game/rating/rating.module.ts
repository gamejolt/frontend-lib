import { NgModule } from 'ng-metadata/core';
import { GameRating } from './rating.model';

@NgModule({
	providers: [
		{ provide: 'Game_Rating', useFactory: () => GameRating }
	],
})
export class GameRatingModule { }
