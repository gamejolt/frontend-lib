import { Component, Input, Output, EventEmitter } from 'ng-metadata/core';
import * as template from '!html-loader!./more-options.component.html';

import { GamePackageCardModel } from './card.model';
import { GameBuild } from '../../build/build.model';
import { Environment } from '../../../environment/environment.service';

@Component({
	selector: 'gj-game-package-card-more-options',
	template,
})
export class GamePackageCardMoreOptionsComponent
{
	@Input() card: GamePackageCardModel;

	@Output() private click = new EventEmitter<GameBuild>();

	emulatorInfo = GameBuild.emulatorInfo;
	Environment = Environment;

	_click( build: GameBuild )
	{
		this.click.emit( build );
	}
}
