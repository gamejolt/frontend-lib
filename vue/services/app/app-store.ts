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

	// Whether or not this page view was server-side rendered.
	hydrated = false;

	hydrateState(k: keyof AppStore, value: any) {
		if (k === 'user' && value) {
			this.user = new User(value);
		} else if (k === 'hydrated') {
			// If we hydrated from ssr vuex, then we know that we should mark as ssr.
			this.hydrated = true;
		} else {
			return false;
		}

		return true;
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
