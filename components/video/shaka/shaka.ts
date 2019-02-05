import View from '!view!./shaka.html?style=./shaka.styl';
import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';

const shakaReady = new Promise(resolve => {
	const interval = setInterval(() => {
		if (!window.shaka || !window.muxjs) {
			return;
		}

		clearInterval(interval);
		resolve();
	}, 200);
});

@View
@Component({})
export class AppVideoShaka extends Vue {
	@Prop(String)
	src!: string;

	@Prop({ type: String, required: false })
	poster?: string;

	@Prop({ type: Boolean, default: true })
	loop!: boolean;

	@Prop({ type: Boolean, default: true })
	muted!: boolean;

	@Prop({ type: Boolean, default: false })
	controls!: boolean;

	@Prop({ type: Boolean, default: true })
	shouldPlay!: boolean;

	@Prop(Object)
	config?: unknown;

	player?: any = null;
	isLoaded = false;

	$el!: HTMLVideoElement;

	mounted() {
		this.initPlayer();
	}

	beforeDestroy() {
		if (this.player) {
			this.player.destroy();
		}
	}

	@Watch('src')
	@Watch('config')
	onSrcChanged() {
		this.initPlayer();
	}

	@Watch('shouldPlay')
	onShouldPlayChange() {
		if (this.isLoaded && this.player) {
			if (this.shouldPlay) {
				this.$el.play();
			} else {
				this.$el.pause();
			}
		}
	}

	async initPlayer() {
		await shakaReady;

		if (this.player) {
			await this.player.unload();
		} else {
			this.player = new window.shaka.Player(this.$el);
		}

		if (this.config) {
			this.player.configure(this.config);
		}

		this.isLoaded = false;
		await this.player.load(this.src);
		this.isLoaded = true;

		if (this.shouldPlay) {
			this.$el.play();
		}
	}
}
