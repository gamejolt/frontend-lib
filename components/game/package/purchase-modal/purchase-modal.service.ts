import { GamePackage } from '../package.model';
import { asyncComponentLoader } from '../../../../utils/utils';
import { Modal } from '../../../modal/modal.service';
import { GameBuild } from '../../build/build.model';
import { Game } from '../../game.model';
import { Sellable } from '../../../sellable/sellable.model';

export class GamePackagePurchaseModal {
	static async show(game: Game, pkg: GamePackage, sellable: Sellable, build?: GameBuild) {
		return await Modal.show<void>({
			component: () => asyncComponentLoader(import('./purchase-modal')),
			size: 'sm',
			props: {
				game,
				sellable,
				package: pkg,
				build,
			},
		});
	}
}
