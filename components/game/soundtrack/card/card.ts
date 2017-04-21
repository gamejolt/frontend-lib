import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import * as View from '!view!./card.html';

import { Game } from '../../game.model';
import { GameSong } from '../../song/song.model';
import { Screen } from '../../../screen/screen-service';
import { makeObservableService } from '../../../../utils/vue';
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
export class AppGameSoundtrackCard extends Vue
{
	@Prop( Game ) game: Game;
	@Prop( Array ) songs: GameSong[];

	isPlaying = false;
	isShowingSoundtrack = false;
	canToggleSoundtrack = false;

	number = number;
	Screen = makeObservableService( Screen );

	@Watch( 'isPlaying' )
	onPlayingChanged()
	{
		// If we're playing, make sure the full soundtrack is open.
		if ( this.isPlaying ) {
			this.isShowingSoundtrack = true;
		}
	}

	play()
	{
		const playlist = this.$refs.playlist as AppAudioPlaylist;
		if ( playlist ) {
			playlist.mainSongButton();
		}
	}

	download()
	{
		const location = {
			name: 'discover.games.view.download.soundtrack',
			params: { slug: this.game.slug, id: this.game.id + '' },
		};

		if ( GJ_IS_CLIENT ) {
			const gui = require( 'nw.gui' );
			gui.Shell.openExternal( Environment.baseUrl + this.$router.resolve( location ).href );
		}

		this.$router.push( location );
	}
}
