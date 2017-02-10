import * as Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import * as View from '!view!./embed.html?style=./embed.styl';

import { Ruler } from '../../ruler/ruler-service';
import { Screen } from '../../screen/screen-service';

const VIDEO_RATIO = 0.5625;  // 16:9

@View
@Component({
	name: 'video-embed',
})
export class AppVideoEmbed extends Vue
{
	@Prop( String ) videoProvider: 'youtube' | 'vimeo';
	@Prop() videoId: string;
	@Prop() maxVideoHeight: number;
	@Prop() maxVideoWidth: number;
	@Prop( { default: false } ) autoplay: boolean;

	embedUrl = '';
	width = 0;
	height = 0;

	mounted()
	{
		this.$nextTick( () => this.recalculateDimensions() );
	}

	@Watch( 'videoId', { immediate: true } )
	videoIdChange()
	{
		if ( !this.videoId ) {
			return;
		}

		console.log( 'update video id' );
		let url: string;

		if ( this.videoProvider === 'youtube' ) {
			url = 'https://www.youtube.com/embed/' + this.videoId;
		}
		else if ( this.videoProvider === 'vimeo' ) {
			url = 'https://player.vimeo.com/video/' + this.videoId;
		}
		else {
			throw new Error( 'Invalid video provider.' );
		}

		if ( this.autoplay ) {
			url += '?autoplay=1';
		}

		this.embedUrl = url;
	}

	recalculateDimensions()
	{
		this.width = Ruler.width( this.$el.getElementsByClassName( 'video-embed-inner' )[0] as HTMLElement );

		if ( this.maxVideoWidth ) {
			this.width = Math.min( this.maxVideoWidth, this.width );
		}

		this.height = this.width * VIDEO_RATIO;

		if ( this.maxVideoHeight && this.height > this.maxVideoHeight ) {
			this.height = this.maxVideoHeight;
			this.width = this.height / VIDEO_RATIO;
		}
	}

}


/*
@Component({
	selector: 'gj-video-embed',
	template,
})
export class VideoEmbedComponent implements OnChanges
{


	constructor(
		@Inject( '$scope' ) $scope: any,
		@Inject( '$element' ) private $element: any,
		@Inject( '$sce' ) private $sce: ng.ISCEService,
		@Inject( '$timeout' ) private $timeout: ng.ITimeoutService,
	)
	{
		this.$timeout( () => this.recalculateDimensions() );

		Screen.setResizeSpy( $scope, () =>
		{
			// Wait till it renders before calculating.
			this.$timeout( () => this.recalculateDimensions() );
		} );
	}



}
*/
