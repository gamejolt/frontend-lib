import { GamePackage } from '../package.model';
import { asyncComponentLoader } from '../../../../utils/utils';
import { Modal } from '../../../modal/modal.service';
import { GameBuild } from '../../build/build.model';
import { Game } from '../../game.model';
import { User } from '../../../user/user.model';

interface GamePackagePurchaseModalOptions {
	game: Game;
	package: GamePackage;
	build?: GameBuild;

	partnerKey?: string;
	partner?: User;
}

export class GamePackagePurchaseModal {
	static async show(options: GamePackagePurchaseModalOptions) {
		return await Modal.show<void>({
			component: () =>
				asyncComponentLoader(
					import(/* webpackChunkName: "GamePackagePurchaseModal" */ './purchase-modal')
				),
			size: 'sm',
			props: options,
			noBackdropClose: true,
			noEscClose: true,
		});
	}
}
