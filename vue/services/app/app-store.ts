import { User } from '../../../components/user/user.model';
import { VuexStore, VuexModule, VuexMutation } from '../../../utils/vuex';
import { namespace, State, Action, Mutation } from 'vuex-class';
import { Environment } from '../../../components/environment/environment.service';

export const AppState = namespace('app', State);
export const AppAction = namespace('app', Action);
export const AppMutation = namespace('app', Mutation);

export type Actions = {};

export type Mutations = {
	'app/setUser': any;
	'app/clearUser': undefined;
	'app/setError': number;
	'app/clearError': undefined;
	'app/redirect': string;
};

@VuexModule()
export class AppStore extends VuexStore<AppStore, Actions, Mutations> {
	user: User | null = null;
	userBootstrapped = false;
	error: number | string | null = null;

	get clientSection() {
		if (GJ_IS_CLIENT) {
			if (window.location.href.startsWith(Environment.wttfBaseUrl)) {
				return 'app';
			} else if (window.location.href.startsWith(Environment.authBaseUrl)) {
				return 'auth';
			} else if (window.location.href.startsWith(Environment.checkoutBaseUrl)) {
				return 'checkout';
			}
		}

		return null;
	}

	@VuexMutation
	setUser(user: Mutations['app/setUser']) {
		if (this.user) {
			this.user.assign(user);
		} else {
			this.user = user;
		}
		this.userBootstrapped = true;
	}

	@VuexMutation
	clearUser() {
		this.user = null;
		this.userBootstrapped = true;
	}

	@VuexMutation
	setError(error: Mutations['app/setError']) {
		this.error = error;
		Environment.ssrContext.errorCode = typeof error === 'string' ? 500 : error;
	}

	@VuexMutation
	clearError() {
		this.error = null;
	}

	@VuexMutation
	redirect(location: Mutations['app/redirect']) {
		if (GJ_IS_SSR) {
			Environment.ssrContext.redirect = location;
		} else {
			window.location.href = location;
		}
	}
}

export const appStore = new AppStore();
