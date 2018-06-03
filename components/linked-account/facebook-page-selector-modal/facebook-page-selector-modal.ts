import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./facebook-page-selector-modal.html';

import { BaseModal } from '../../modal/base';
import { LinkedAccount, FacebookPage } from '../linked-account.model';
import { AppLinkedAccount } from '../linked-account';
import { Api } from '../../api/api.service';
import { AppLoading } from '../../../vue/components/loading/loading';

@View
@Component({
	components: {
		AppLinkedAccount,
		AppLoading,
	},
})
export default class AppModalFacebookPageSelector extends BaseModal {
	@Prop(String) message: string;
	@Prop(LinkedAccount) account: LinkedAccount;
	@Prop(String) title: string;
	@Prop(String) buttonType: 'ok' | 'yes';

	isLoading = true;
	pages: FacebookPage[];
	selectedPage: FacebookPage;

	get canConfirm() {
		return (
			this.selectedPage &&
			(this.account.facebookSelectedPage === null ||
				this.selectedPage.id !== this.account.facebookSelectedPage.id)
		);
	}

	async created() {
		const payload = await Api.sendRequest(
			'/web/dash/developer/games/linked-accounts/facebook-pages/' +
				this.account.game!.id +
				'/' +
				this.account.id,
			null,
			{ detach: true }
		);
		this.pages = payload.pages;
		if (this.account.facebookSelectedPage) {
			this.selectedPage = this.account.facebookSelectedPage;
		} else if (this.pages.length > 0) {
			this.selectedPage = this.pages[0];
		}
		this.isLoading = false;
	}

	changeSelected(pageId: number) {
		const page = this.pages.find(p => p.id === pageId);
		if (page) {
			this.selectedPage = page;
		}
	}

	ok() {
		this.modal.resolve(this.selectedPage);
	}

	cancel() {
		this.modal.resolve(false);
	}
}
