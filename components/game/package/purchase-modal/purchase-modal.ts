import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./purchase-modal.html?style=./purchase-modal.styl';

import { BaseModal } from '../../../modal/base';
import { GamePackage } from '../package.model';
import { GameBuild } from '../../build/build.model';
import { AppJolticon } from '../../../../vue/components/jolticon/jolticon';
import { FormGamePackagePayment } from '../payment-form/payment-form';
import { Game } from '../../game.model';
import { Sellable } from '../../../sellable/sellable.model';
import { Analytics } from '../../../analytics/analytics.service';
import { GameDownloader } from '../../downloader/downloader.service';
import { User } from '../../../user/user.model';
import { AppLoading } from '../../../../vue/components/loading/loading';
import { Growls } from '../../../growls/growls.service';
import {
	ClientLibraryAction,
	ClientLibraryStore,
} from '../../../../../../app/store/client-library';

@View
@Component({
	components: {
		AppLoading,
		AppJolticon,
		FormGamePackagePayment,
	},
})
export default class AppGamePackagePurchaseModal extends BaseModal {
	@ClientLibraryAction packageInstall: ClientLibraryStore['packageInstall'];

	@Prop(Game) game: Game;
	@Prop(GamePackage) package: GamePackage;
	@Prop(GameBuild) build?: GameBuild;
	@Prop(String) partnerKey?: string;
	@Prop(User) partner?: User;

	sellable: Sellable = null as any;

	created() {
		this.sellable = this.package._sellable!;
	}

	bought() {
		// Hack to show the sellable as bought without pulling from API.
		this.sellable.is_owned = true;
		if (this.game.sellable && this.game.sellable.id === this.sellable.id) {
			this.game.sellable.is_owned = true;
		}

		Growls.success({
			title: this.$gettext('Order Complete'),
			message: this.$gettextInterpolate(
				'Warm thanks from both %{ developer } and the Game Jolt team.',
				{ developer: this.game.developer.display_name }
			),
			sticky: true,
		});

		this.modal.dismiss();
	}

	skipPayment() {
		if (!this.build) {
			throw new Error(`Build isn't set`);
		}

		// When they skip a pwyw payment form, on client we need to start the
		// install.
		if (GJ_IS_CLIENT) {
			Analytics.trackEvent('game-package-card', 'install');

			this.packageInstall([
				this.game,
				this.build._package!,
				this.build._release!,
				this.build,
				this.build._launch_options!,
			]);
		} else {
			this.download(this.build!);
		}
		this.modal.dismiss();
	}

	private download(build: GameBuild) {
		Analytics.trackEvent('game-purchase-modal', 'download', 'download');
		GameDownloader.download(this.$router, this.game, build);
	}
}
