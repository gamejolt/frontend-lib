import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./purchase-modal.html?style=./purchase-modal.styl';

import { BaseModal } from '../../../modal/base';
import { GamePackage } from '../package.model';
import { GameBuild } from '../../build/build.model';
import { AppJolticon } from '../../../../vue/components/jolticon/jolticon';
import { FormGamePackagePayment } from '../payment-form/payment-form';
import { Game } from '../../game.model';
import { Sellable } from '../../../sellable/sellable.model';

@View
@Component({
	components: {
		AppJolticon,
		FormGamePackagePayment,
	},
})
export default class AppGamePackagePurchaseModal extends BaseModal {
	@Prop(Game) game: Game;

	@Prop(GamePackage) package: GamePackage;

	@Prop(Sellable) sellable: Sellable;

	@Prop(GameBuild) build?: GameBuild;
}
