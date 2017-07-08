import * as nwGui from 'nw.gui';

import VueRouter from 'vue-router';
import { Api } from '../../api/api.service';
import { User } from '../user.model';
import { Growls } from '../../growls/growls.service';
import { Translate } from '../../translate/translate.service';

export type Provider = 'twitter' | 'facebook' | 'twitch' | 'google';

export class UserLinkedAccounts {
	static async login(router: VueRouter, provider: Provider) {
		// Client flow is a bit different...
		if (GJ_IS_CLIENT) {
			return this.loginClient(router, provider);
		}

		const response = await Api.sendRequest('/web/auth/' + provider, {});
		window.location.href = response.redirectLocation;
	}

	static async loginClient(router: VueRouter, provider: Provider) {
		const response = await Api.sendRequest(
			'/web/auth/' + provider + '?client',
			{}
		);

		// Gotta open a browser window for them to complete the sign up/login.
		const gui = require('nw.gui') as typeof nwGui;
		gui.Shell.openExternal(response.redirectLocation);

		// Now redirect them to the page that will continuously check if they
		// are authed yet. We pass in the request token returned since this is
		// what tells us our oauth state.
		router.push({
			name: 'auth.linked-account.poll',
			params: { token: response.token },
		});
	}

	static async link(router: VueRouter, provider: Provider) {
		// Client flow is a bit different...
		if (GJ_IS_CLIENT) {
			return this.linkClient(router, provider);
		}

		const response = await Api.sendRequest(
			'/web/dash/linked-accounts/link/' + provider,
			{}
		);
		window.location.href = response.redirectLocation;
	}

	static async linkClient(router: VueRouter, provider: Provider) {
		const response = await Api.sendRequest(
			'/web/dash/linked-accounts/link/' + provider + '?client',
			{}
		);

		// Gotta open a browser window for them to complete the sign up/login.
		const gui = require('nw.gui') as typeof nwGui;
		gui.Shell.openExternal(response.redirectLocation);

		// Now redirect them to the page that will continuously check if they
		// are linked yet. We pass in the request token returned since this is
		// what tells us our oauth state.
		router.push({
			name: 'dash.account.linked-accounts.linking',
			query: { token: response.token },
		});
	}

	static async unlink(user: User, provider: Provider) {
		let providerUpper: string;

		if (provider === 'twitter') {
			providerUpper = 'Twitter';
		} else if (provider === 'facebook') {
			providerUpper = 'Facebook';
		} else if (provider === 'twitch') {
			providerUpper = 'Twitch';
		} else if (provider === 'google') {
			providerUpper = 'Google+';
		} else {
			throw new Error(`Invalid provider.`);
		}

		try {
			await user.$unlinkAccount(provider);
			Growls.success(
				Translate.$gettextInterpolate(
					`Your %{ provider } account has been unlinked from the site.`,
					{ provider: providerUpper }
				),
				Translate.$gettext('Account Unlinked')
			);
		} catch (e) {
			if (!e || !e.success) {
				if (e.reason && e.reason === 'no-password') {
					throw e.reason;
				}
			}

			Growls.error(
				Translate.$gettextInterpolate(
					`Could not unlink your %{ provider } account.`,
					{ provider: providerUpper }
				)
			);
			throw e;
		}
	}
}
