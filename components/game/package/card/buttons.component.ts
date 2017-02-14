import { Component, Input, Output, EventEmitter } from 'ng-metadata/core';
import * as template from '!html-loader!./buttons.component.html';

import { GamePackageCardModel } from './card.model';
import { GamePackage } from '../package.model';
import { GameBuild } from '../../build/build.model';

@Component({
	selector: 'gj-game-package-card-buttons',
	template,
})
export class GamePackageCardButtonsComponent
{
	@Input() package: GamePackage;
	@Input() card: GamePackageCardModel;

	@Output() private click = new EventEmitter<{
		build: GameBuild,
		fromExtraSection: boolean,
	}>();

	_click( build: GameBuild, fromExtraSection = false )
	{
		this.click.emit( { build, fromExtraSection } );
	}
}
