import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./video.html?style=./video.styl';

import { AppLoading } from '../../vue/components/loading/loading';

// We have to not use Vue for video embed stuff!
// https://forum.ionicframework.com/t/ionic-2-video-video-memory-leak-garbage-collection-solved/52333
// Massive memory leaks if we don't keep this out of Vue and finely tuned.

@View
@Component({
	components: {
		AppLoading,
	},
})
export class AppVideo extends Vue {
	@Prop([String])
	poster: string;
	@Prop([String])
	webm: string;
	@Prop([String])
	mp4: string;
	@Prop({ type: Boolean, default: false })
	showLoading: boolean;

	isLoaded = false;

	private video: HTMLVideoElement;

	mounted() {
		const webm = document.createElement('source');
		webm.type = 'video/webm';
		webm.src = this.webm;

		const mp4 = document.createElement('source');
		mp4.type = 'video/mp4';
		mp4.src = this.mp4;

		this.video = document.createElement('video');
		this.video.style.display = 'block';
		this.video.style.width = '100%';
		this.video.poster = this.poster;
		this.video.loop = true;

		this.video.appendChild(webm);
		this.video.appendChild(mp4);

		// This event continues to spawn.
		// Gotta remove once it fires the first time.
		let canplaythrough = () => {
			this.isLoaded = true;
			this.video.play();
			this.video.removeEventListener('canplaythrough', canplaythrough);
		};

		this.video.addEventListener('canplaythrough', canplaythrough);

		this.$el.appendChild(this.video);
	}

	/**
	 * This is ridiculous, but it's needed. Memory leaks if we don't!
	 * https://dev.w3.org/html5/spec-author-view/video.html#best-practices-for-authors-using-media-elements
	 */
	beforeDestroy() {
		if (this.video) {
			// Empty all sources.
			while (this.video.firstChild) {
				this.video.removeChild(this.video.firstChild);
			}

			this.video.load();
		}
	}
}
