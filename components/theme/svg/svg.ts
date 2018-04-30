import Vue from 'vue';
import Axios from 'axios';
import { Component, Prop, Watch } from 'vue-property-decorator';

import { ThemeState, ThemeStore } from '../theme.store';
import { CreateElement } from 'vue/types/vue';

@Component({})
export class AppThemeSvg extends Vue {
	@Prop(String) src: string;

	@ThemeState theme: ThemeStore['theme'];

	rawSvg = '';
	request: Promise<any>;

	get processedSvg() {
		let svgData = this.rawSvg;

		if (this.theme) {
			let fg = '#' + this.theme.biFg_;
			let bg = '#' + this.theme.biBg_;
			let notice = '#' + this.theme.notice_;

			if (this.theme.custom) {
				fg = '#' + this.theme.highlight_;
				bg = '#' + this.theme.highlightFg_;
			}

			svgData = svgData
				.replace('#ccff00', fg)
				.replace('#2f7f6f', bg)
				.replace('#ff3fac', notice);
		}

		return 'data:image/svg+xml;utf8,' + encodeURIComponent(svgData);
	}

	@Watch('src', { immediate: true })
	onSrcChange() {
		const request = Axios.get(this.src).then(response => {
			// If we have multiple requests in process, only handle the latest one.
			if (this.request !== request) {
				return;
			}

			if (response.status === 200) {
				this.rawSvg = response.data;
			}
		});

		this.request = request;
	}

	render(h: CreateElement) {
		return h('img', { domProps: { src: this.processedSvg } });
	}
}
