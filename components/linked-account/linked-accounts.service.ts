import VueRouter from 'vue-router';
import { Api } from '../api/api.service';
import { Provider } from './linked-account.model';

export class LinkedAccounts {
	static async link(router: VueRouter, provider: Provider, routeUrl: string) {
		// todo: client

		const response = await Api.sendRequest(routeUrl + provider, {});
		window.location.href = response.redirectLocation;
	}
}
