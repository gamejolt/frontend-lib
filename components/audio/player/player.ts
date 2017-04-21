import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';

import { GameSong } from '../../game/song/song.model';

@Component({})
export class AppAudioPlayer extends Vue
{
	@Prop( GameSong ) song: GameSong;

	$el: HTMLAudioElement;

	src = '';

	private timer?: NodeJS.Timer;

	@Watch( 'song.url' )
	onChanged()
	{
		this.setup();
	}

	mounted()
	{
		this.setup();
	}

	render( h: Vue.CreateElement )
	{
		return h( 'audio', {
			domProps: {
				src: this.song.url,
				preload: 'auto',
			},
		} );
	}

	destroyed()
	{
		this.clearWatcher();
	}

	seek( time: number )
	{
		this.$el.currentTime = time;
	}

	private async setup()
	{
		this.clearWatcher();

		await this.$nextTick();

		this.$el.play();
		this.setWatcher();
	}

	private onSongEnded( sendEvent: boolean )
	{
		this.clearWatcher();

		if ( sendEvent && this.onSongEnded ) {
			this.$emit( 'end' );
		}
	}

	private setWatcher()
	{
		this.timer = setInterval( () =>
		{
			if ( this.$el.ended ) {
				this.onSongEnded( true );
			}
			else {
				this.$emit( 'duration', {
					currentTime: this.$el.currentTime,
					duration: this.$el.duration,
				} );
			}
		}, 250 );
	}

	private clearWatcher()
	{
		if ( this.timer ) {
			clearInterval( this.timer );
			this.timer = undefined;
		}
	}
}
