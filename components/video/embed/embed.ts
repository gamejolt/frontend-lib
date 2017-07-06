import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { Subscription } from 'rxjs/Subscription';
import * as View from '!view!./embed.html?style=./embed.styl';

import { Ruler } from '../../ruler/ruler-service';
import { Screen } from '../../screen/screen-service';

const VIDEO_RATIO = 0.5625; // 16:9

@View
@Component({})
export class AppVideoEmbed extends Vue {
	@Prop([String])
	videoProvider: 'youtube' | 'vimeo';
	@Prop([String])
	videoId: string;
	@Prop([Number])
	maxVideoHeight: number;
	@Prop([Number])
	maxVideoWidth: number;
	@Prop({ type: Boolean, default: false })
	autoplay: boolean;

	embedUrl = '';
	width = 0;
	height = 0;

	private resize$: Subscription | undefined;

	mounted() {
		this.recalculateDimensions();
		this.resize$ = Screen.resizeChanges.subscribe(() =>
			this.recalculateDimensions()
		);
	}

	destroyed() {
		if (this.resize$) {
			this.resize$.unsubscribe();
			this.resize$ = undefined;
		}
	}

	@Watch('videoId', { immediate: true })
	videoIdChange() {
		if (!this.videoId) {
			return;
		}

		let url: string;

		if (this.videoProvider === 'youtube') {
			url = 'https://www.youtube.com/embed/' + this.videoId;
		} else if (this.videoProvider === 'vimeo') {
			url = 'https://player.vimeo.com/video/' + this.videoId;
		} else {
			throw new Error('Invalid video provider.');
		}

		if (this.autoplay) {
			url += '?autoplay=1';
		}

		this.embedUrl = url;
	}

	async recalculateDimensions() {
		await this.$nextTick();

		this.width = Ruler.width(
			this.$el.getElementsByClassName('video-embed-inner')[0] as HTMLElement
		);

		if (this.maxVideoWidth) {
			this.width = Math.min(this.maxVideoWidth, this.width);
		}

		this.height = this.width * VIDEO_RATIO;

		if (this.maxVideoHeight && this.height > this.maxVideoHeight) {
			this.height = this.maxVideoHeight;
			this.width = this.height / VIDEO_RATIO;
		}
	}
}
