import { Component, Inject, Input, Output } from '@angular/core';
import { App } from './../../../../../app/app-service';
import template from 'html!./play-modal.html';

@Component({
	selector: 'gj-game-play-modal',
	template,
})
export class PlayModalComponent
{
	adShown = false;

	@Input( '<' ) game: any;
	@Input( '<' ) build: any;
	@Input( '<' ) canMinimize: boolean;

	@Output() minimize: Function;
	@Output() maximize: Function;
	@Output() close: Function;

	constructor(
		@Inject( 'App' ) app: App,
	)
	{
		// If the game has ads turned off, set it as "shown" initially.
		this.adShown = !this.game._should_show_ads;

		// If this is the developer of the game, don't show an ad.
		if ( app.user && this.game.developer.id == app.user.id ) {
			this.adShown = true;
		}
	}

	onAdShown()
	{
		this.adShown = true;
	}
}
