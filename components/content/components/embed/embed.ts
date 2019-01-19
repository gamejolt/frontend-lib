import View from '!view!./embed.html?style=./embed.styl';
import { ContextCapabilities } from 'game-jolt-frontend-lib/components/content/content-context';
import { AppWidgetCompilerWidgetSoundcloud } from 'game-jolt-frontend-lib/components/widget-compiler/widget-soundcloud/widget-soundcloud';
import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { AppVideoEmbed } from '../../../video/embed/embed';
import { ContentHydrator } from '../../content-hydrator';
import { AppBaseContentComponent } from '../base/base-content-component';
import { AppContentEmbedGameEmbed } from './game/game-embed';

@View
@Component({
	components: {
		AppVideoEmbed,
		AppBaseContentComponent,
		AppWidgetCompilerWidgetSoundcloud,
		AppContentEmbedGameEmbed,
	},
})
export class AppContentEmbed extends Vue {
	@Prop(String)
	type!: string;

	@Prop(String)
	source!: string;

	@Prop(Object)
	capabilities!: ContextCapabilities;

	@Prop(ContentHydrator)
	hydrator!: ContentHydrator;

	@Prop(Boolean)
	isEditing!: boolean;

	$refs!: {
		placeholderInput: HTMLElement;
	};

	get hasContent() {
		return this.type && this.source;
	}

	async mounted() {
		// If the placeholder input is available, focus it immediately
		if (this.$refs.placeholderInput) {
			this.$refs.placeholderInput.focus();
		}
	}

	onRemoved() {
		this.$emit('removed');
	}

	onpaste(e: ClipboardEvent) {
		// Make a 200% sure this event does not get propagated
		e.preventDefault();
		e.stopPropagation();

		const clipboardData = e.clipboardData;
		if (!clipboardData) {
			return;
		}

		const pastedText = clipboardData.getData('Text');
		if (pastedText) {
			this.handlePastedText(pastedText);
		}
	}

	private emitEmbed(type: string, source: string) {
		this.$emit('updateAttrs', {
			type,
			source,
		});
	}

	private handlePastedText(text: string) {
		text = text.trim();
		const lines = text.split(/\r?\n/);

		// Figure out what kind of link/embed has been pasted
		// Go through all lines of pasted content individually
		// This also has to take capabilities into account

		for (const line of lines) {
			const gameJoltGameId = this.tryGameJoltGame(line);
			if (gameJoltGameId) {
				this.emitEmbed('game-jolt-game', gameJoltGameId);
				return;
			}

			const youtubeVideoId = this.tryYouTube(line);
			if (youtubeVideoId) {
				this.emitEmbed('youtube-video', youtubeVideoId);
				return;
			}

			const soundcloudSongId = this.trySoundCloud(line);
			if (soundcloudSongId) {
				this.emitEmbed('soundcloud-song', soundcloudSongId);
				return;
			}
		}
	}

	private tryGameJoltGame(text: string) {
		if (!this.capabilities.embedGame) {
			return null;
		}

		// gamejolt.com/games/name/id
		const regex = new RegExp(/gamejolt.com\/games\/.+?\/([0-9]+)/);
		const results = regex.exec(text);
		if (results !== null && results.length === 2) {
			const gameId = parseInt(results[1]);
			if (gameId !== NaN) {
				return gameId.toString();
			}
		}

		return null;
	}

	private tryYouTube(text: string) {
		if (!this.capabilities.embedVideo) {
			return null;
		}

		// Support:
		// youtube.com/watch -> v=id
		// m.youtube.com/watch -> v=id

		try {
			const url = new URL(text);
			if (/(.+\.)?youtube\.com/i.test(url.hostname)) {
				const videoId = url.searchParams.get('v');
				if (videoId !== null && videoId.length === 11) {
					return videoId;
				}
			}
		} catch (error) {
			// Swallow error. new Url throws on invalid URLs, which can very well happen.
		}

		return null;
	}

	private trySoundCloud(text: string) {
		if (!this.capabilities.embedMusic) {
			return null;
		}

		// SoundCloud requires the user to paste the embed code because their song links don't include the song id
		const regex = new RegExp(/api\.soundcloud\.com\/tracks\/(\d+)/);
		const results = regex.exec(text);
		if (results !== null && results.length === 2) {
			const songId = parseInt(results[1]);
			if (songId !== NaN) {
				return songId.toString();
			}
		}

		return null;
	}
}
