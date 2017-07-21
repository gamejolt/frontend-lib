import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./page.html?style=./page.styl';

import { AppStore, AppMutation, AppState } from '../../../vue/services/app/app-store';
import { ErrorPages } from './page-components';

@View
@Component({})
export class AppErrorPage extends Vue {
	@AppState error: AppStore['error'];
	@AppMutation clearError: AppStore['clearError'];

	watcher?: Function;

	get page() {
		if (this.error) {
			return ErrorPages[this.error];
		}
	}

	mounted() {
		this.watcher = this.$router.beforeEach((_to, _from, next) => {
			if (this.error) {
				this.clearError();
			}
			next();
		});
	}

	destroyed() {
		if (this.watcher) {
			this.watcher();
			this.watcher = undefined;
		}
	}
}
