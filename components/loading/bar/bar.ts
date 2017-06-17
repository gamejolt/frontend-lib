import Vue from 'vue';
import Axios from 'axios';
import { Component, Watch } from 'vue-property-decorator';
import * as View from '!view!./bar.html?style=./bar.styl';

@View
@Component({})
export class AppLoadingBar extends Vue {
	requestCount = 0;
	completedCount = 0;

	private clearTimeout?: NodeJS.Timer;

	get width() {
		if (!this.requestCount) {
			return 0;
		}

		return this.completedCount / this.requestCount * 100;
	}

	mounted() {
		Axios.interceptors.request.use(
			config => {
				this.addRequest(config);
				return config;
			},
			error => {
				this.addComplete(error.config);
				return Promise.reject(error);
			}
		);

		Axios.interceptors.response.use(
			response => {
				this.addComplete(response.config);
				return response;
			},
			error => {
				this.addComplete(error.config);
				return Promise.reject(error);
			}
		);
	}

	@Watch('requestCount')
	@Watch('completedCount')
	onCountChange() {
		if (!this.requestCount) {
			return;
		}

		if (this.completedCount >= this.requestCount) {
			this.clear();
		}
	}

	private addRequest(config: any) {
		if (config.ignoreLoadingBar) {
			return;
		}

		// If we had a clear set, then let's cancel that out.
		if (this.clearTimeout) {
			clearTimeout(this.clearTimeout);
			this.clearTimeout = undefined;
		}

		++this.requestCount;
	}

	private addComplete(config: any) {
		if (config.ignoreLoadingBar) {
			return;
		}

		++this.completedCount;
	}

	private clear() {
		// Wait for the 100% width to show first.
		this.clearTimeout = setTimeout(() => {
			this.requestCount = 0;
			this.completedCount = 0;
		}, 300);
	}
}
