import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./playlist.html?style=./playlist.styl';

import { GameSong } from '../../game/song/song.model';
import { AppAudioPlayer } from '../player/player';
import { AppAudioScrubber } from '../scrubber/scrubber';
import { AppJolticon } from '../../../vue/components/jolticon/jolticon';
import { AppTrackEvent } from '../../analytics/track-event.directive.vue';
import { time } from '../../../vue/filters/time';

@View
@Component({
	components: {
		AppAudioPlayer,
		AppAudioScrubber,
		AppJolticon,
	},
	directives: {
		AppTrackEvent,
	},
	filters: {
		time,
	},
})
export class AppAudioPlaylist extends Vue
{
	@Prop( Array ) songs: GameSong[];

	currentSong: GameSong | null = null;
	duration = 0;
	currentTime = 0;

	durationEvent( event: { duration: number, currentTime: number } )
	{
		this.duration = event.duration;
		this.currentTime = event.currentTime;
	}

	toggleSong( song: GameSong )
	{
		if ( this.currentSong && this.currentSong.id === song.id ) {
			this.stopSong();
		}
		else {
			this.playSong( song );
		}
	}

	playSong( song: GameSong )
	{
		this.currentSong = song;
		this.$emit( 'play' );
	}

	async seek( pos: number )
	{
		const time = this.duration * pos;
		let player = this.$refs.player as AppAudioPlayer | undefined;

		if ( !player ) {
			this.mainSongButton();
			await this.$nextTick();
			player = this.$refs.player as AppAudioPlayer;
		}

		player.seek( time );
	}

	stopSong()
	{
		this.currentSong = null;
		this.$emit( 'stop' );
	}

	mainSongButton()
	{
		if ( !this.currentSong ) {
			this.playSong( this.songs[0] );
		}
		else {
			this.stopSong();
		}
	}

	onSongEnded()
	{
		if ( !this.currentSong ) {
			return;
		}

		// If last song, just stop.
		if ( this.currentSong.id === this.songs[ this.songs.length - 1 ].id ) {
			this.stopSong();
		}
		else {
			const currentIndex = this.songs.findIndex( ( item ) => item.id === this.currentSong!.id );
			if ( currentIndex !== -1 ) {
				this.playSong( this.songs[ currentIndex + 1 ] );
			}
		}
	}
}
