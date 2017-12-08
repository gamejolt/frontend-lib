import * as nwGui from 'nw.gui';

import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import View from '!view!./card.html';

import { Game } from '../../game.model';
import { GameSong } from '../../song/song.model';
import { Screen } from '../../../screen/screen-service';
import { Environment } from '../../../environment/environment.service';
import { AppJolticon } from '../../../../vue/components/jolticon/jolticon';
import { AppFadeCollapse } from '../../../fade-collapse/fade-collapse';
import { AppAudioPlaylist } from '../../../audio/playlist/playlist';
import { AppTrackEvent } from '../../../analytics/track-event.directive.vue';
import { AppCard } from '../../../card/card';
import { number } from '../../../../vue/filters/number';

@View
@Component({
	components: {
		AppCard,
		AppJolticon,
		AppFadeCollapse,
		AppAudioPlaylist,
	},
	directives: {
		AppTrackEvent,
	},
})
export class AppGameSoundtrackCard extends Vue {
	@Prop(Game) game: Game;
	@Prop(Array) songs: GameSong[];

	isPlaying = false;
	isShowingSoundtrack = false;
	canToggleSoundtrack = false;

	readonly number = number;
	readonly Screen = Screen;

	@Watch('isPlaying')
	onPlayingChanged() {
		// If we're playing, make sure the full soundtrack is open.
		if (this.isPlaying) {
			this.isShowingSoundtrack = true;
		}
	}

	play() {
		const playlist = this.$refs.playlist as AppAudioPlaylist;
		if (playlist) {
			playlist.mainSongButton();
		}
	}

	download() {
		const location = {
			name: 'discover.games.view.download.soundtrack',
			params: { slug: this.game.slug, id: this.game.id + '' },
		};

		if (GJ_IS_CLIENT) {
			const gui = require('nw.gui') as typeof nwGui;
			// Gotta go past the first char since it's # in client.
			gui.Shell.openExternal(Environment.baseUrl + this.$router.resolve(location).href.substr(1));
			return;
		}

		this.$router.push(location);
	}
}
