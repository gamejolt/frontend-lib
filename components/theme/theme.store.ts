import { namespace, State, Action, Mutation } from 'vuex-class';
import { VuexModule, VuexMutation, VuexStore } from '../../utils/vuex';
import { Theme } from './theme.model';
import { appStore } from '../../vue/services/app/app-store';

export const ThemeStoreNamespace = 'theme';
export const ThemeState = namespace(ThemeStoreNamespace, State);
export const ThemeAction = namespace(ThemeStoreNamespace, Action);
export const ThemeMutation = namespace(ThemeStoreNamespace, Mutation);

export type ThemeActions = {};

export type ThemeMutations = {
	'theme/sync': void;
	'theme/setDark': boolean;
	'theme/setAlwaysOurs': boolean;
	'theme/setUserTheme': Theme | null;
	'theme/setPageTheme': Theme | null;
	'theme/setFormTheme': Theme | null;
};

@VuexModule()
export class ThemeStore extends VuexStore<ThemeStore, ThemeActions, ThemeMutations> {
	isDark = false;
	alwaysOurs = false;
	pageTheme: Theme | null = null;
	formTheme: Theme | null = null;

	get userTheme() {
		return (appStore.state.user && appStore.state.user.theme) || null;
	}

	get theme() {
		return this.alwaysOurs
			? this.formTheme || this.userTheme
			: this.formTheme || this.pageTheme || this.userTheme;
	}

	@VuexMutation
	setDark(state: ThemeMutations['theme/setDark']) {
		this.isDark = state;
	}

	@VuexMutation
	setAlwaysOurs(state: ThemeMutations['theme/setAlwaysOurs']) {
		this.alwaysOurs = state;
	}

	@VuexMutation
	setUserTheme(theme: ThemeMutations['theme/setUserTheme']) {
		if (appStore.state.user) {
			appStore.state.user.theme = theme;
		}
	}

	@VuexMutation
	setPageTheme(theme: ThemeMutations['theme/setPageTheme']) {
		this.pageTheme = theme;
	}

	@VuexMutation
	setFormTheme(theme: ThemeMutations['theme/setFormTheme']) {
		this.formTheme = theme;
	}
}
