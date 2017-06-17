import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./page.html?style=./page.styl';

import {
	AppStore,
	AppMutation,
	AppState,
} from '../../../vue/services/app/app-store';
import { ErrorPages } from './page-components';

@View
@Component({})
export class AppErrorPage extends Vue {
	@AppState error: AppStore['error'];
	@AppMutation clearError: AppStore['clearError'];

	created() {
		this.$router.beforeResolve((_to, _from, next) => {
			if (this.error) {
				this.clearError();
			}
			next();
		});
	}

	get page() {
		if (this.error) {
			return ErrorPages[this.error];
		}
	}
}
