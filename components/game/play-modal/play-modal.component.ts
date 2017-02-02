import { Component, Input, Output, Inject, EventEmitter } from 'ng-metadata/core';
import * as template from '!html-loader!./play-modal.component.html';

import { Environment } from '../../environment/environment.service';

@Component({
	selector: 'gj-game-play-modal',
	template,
})
export class PlayModalComponent
{
	@Input( '<' ) game: any;
	@Input( '<' ) build: any;
	@Input( '<' ) key?: string;
	@Input( '<' ) canMinimize: boolean;

	@Output( 'minimize' ) private _minimize = new EventEmitter<void>();
	@Output( 'close' ) private _close = new EventEmitter<void>();

	embedUrl = '';

	constructor(
		@Inject( '$sce' ) private $sce: ng.ISCEService,
		@Inject( '$element' ) private $element: ng.IAugmentedJQuery,
	)
	{
		this.embedUrl = this.$sce.getTrustedResourceUrl( `${Environment.secureBaseUrl}/x/builds/get-download-url/${this.build.id}?key=${this.key}` );
	}

	focus()
	{
		const gameFrame: HTMLElement = <any>this.$element[0].querySelector( '#online-game-frame' );
		if ( gameFrame ) {
			gameFrame.focus();
		}
	}

	minimize()
	{
		this._minimize.emit( undefined );
	}

	close()
	{
		this._close.emit( undefined );
	}
}
