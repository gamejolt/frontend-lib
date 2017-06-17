import { NgModule } from 'ng-metadata/core';
// import { GamePackageCardComponent } from './card.component';
// import { GamePackageCardButtonsComponent } from './buttons.component';
// import { GamePackageCardMoreOptionsComponent } from './more-options.component';

angular.module('gj.Game.Package.Card', []);

require('./payment-form-directive');

@NgModule({
	imports: ['gj.Game.Package.Card'],
	declarations: [
		// GamePackageCardComponent,
		// GamePackageCardButtonsComponent,
		// GamePackageCardMoreOptionsComponent,
	],
})
export class GamePackageCardModule {}
