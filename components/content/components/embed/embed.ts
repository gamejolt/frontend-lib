import View from '!view!./embed.html?style=./embed.styl';
import { AppWidgetCompilerWidgetSoundcloud } from 'game-jolt-frontend-lib/components/widget-compiler/widget-soundcloud/widget-soundcloud';
import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { AppVideoEmbed } from '../../../video/embed/embed';
import { ContentOwner } from '../../content-owner';
import { AppBaseContentComponent } from '../base/base-content-component';
import { AppContentEmbedCommunityEmbed } from './community/community-embed';
import { AppContentEmbedGameEmbed } from './game/game-embed';
import { AppContentEmbedUserEmbed } from './user/user-embed';

@View
@Component({
	components: {
		AppVideoEmbed,
		AppBaseContentComponent,
		AppWidgetCompilerWidgetSoundcloud,
		AppContentEmbedGameEmbed,
		AppContentEmbedUserEmbed,
		AppContentEmbedCommunityEmbed,
	},
})
export class AppContentEmbed extends Vue {
	@Prop(String)
	type!: string;

	@Prop(String)
	source!: string;

	@Prop(Object)
	owner!: ContentOwner;

	@Prop(Boolean)
	isEditing!: boolean;

	$refs!: {
		placeholderInput: HTMLElement;
	};

	get capabilities() {
		return this.owner.getCapabilities();
	}

	get hydrator() {
		return this.owner.getHydrator();
	}

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
			const gameJoltUsername = this.tryGameJoltUser(line);
			if (gameJoltUsername !== false) {
				this.emitEmbed('game-jolt-user', gameJoltUsername);
				return;
			}

			const gameJoltGameId = this.tryGameJoltGame(line);
			if (gameJoltGameId !== false) {
				this.emitEmbed('game-jolt-game', gameJoltGameId);
				return;
			}

			const gameJoltCommunityPath = this.tryGameJoltCommunity(line);
			if (gameJoltCommunityPath !== false) {
				this.emitEmbed('game-jolt-community', gameJoltCommunityPath);
				return;
			}

			const youtubeVideoId = this.tryYouTube(line);
			if (youtubeVideoId !== false) {
				this.emitEmbed('youtube-video', youtubeVideoId);
				return;
			}

			const soundcloudSongId = this.trySoundCloud(line);
			if (soundcloudSongId !== false) {
				this.emitEmbed('soundcloud-song', soundcloudSongId);
				return;
			}
		}
	}

	private tryGameJoltCommunity(text: string) {
		if (!this.capabilities.embedCommunity) {
			return false;
		}

		// gamejolt.com/c/path
		const results = /gamejolt.com\/c\/([a-z0-9-_]{1,50})/i.exec(text);
		if (results !== null && results.length === 2) {
			const communityPath = results[1];
			return communityPath;
		}

		return false;
	}

	private tryGameJoltUser(text: string) {
		if (!this.capabilities.embedUser) {
			return false;
		}

		// gamejolt.com/@username
		const results = /gamejolt.com\/@([a-z0-9]{1,30})/i.exec(text);
		if (results !== null && results.length === 2) {
			const username = results[1];
			return username;
		}

		return false;
	}

	private tryGameJoltGame(text: string) {
		if (!this.capabilities.embedGame) {
			return false;
		}

		// gamejolt.com/games/name/id
		const results = /gamejolt.com\/games\/.+?\/([0-9]+)/i.exec(text);
		if (results !== null && results.length === 2) {
			const gameId = parseInt(results[1]);
			if (gameId !== NaN) {
				return gameId.toString();
			}
		}

		return false;
	}

	private tryYouTube(text: string) {
		if (!this.capabilities.embedVideo) {
			return false;
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

		return false;
	}

	private trySoundCloud(text: string) {
		if (!this.capabilities.embedMusic) {
			return false;
		}

		// SoundCloud requires the user to paste the embed code because their song links don't include the song id
		const results = /api\.soundcloud\.com\/tracks\/(\d+)/i.exec(text);
		if (results !== null && results.length === 2) {
			const songId = parseInt(results[1]);
			if (songId !== NaN) {
				return songId.toString();
			}
		}

		return false;
	}
}
