import { Component, Input, Inject, OnChanges, SimpleChanges } from 'ng-metadata/core';
import { Ruler } from './../ruler/ruler-service';
import { Screen } from './../screen/screen-service';
import template from './video-embed.html';

const VIDEO_RATIO = 0.5625;  // 16:9

@Component({
	selector: 'gj-video-embed',
	template,
})
export class VideoEmbedComponent implements OnChanges
{
	@Input( '@' ) videoProvider: 'youtube' | 'vimeo';
	@Input( '<' ) videoId: string;
	@Input( '<?' ) maxVideoHeight: number;
	@Input( '<?' ) maxVideoWidth: number;
	@Input( '<?' ) autoplay: boolean;

	embedUrl: string;
	width: number;
	height: number;

	constructor(
		@Inject( '$scope' ) private $scope: any,
		@Inject( '$element' ) private $element: any,
		@Inject( '$sce' ) private $sce: ng.ISCEService,
		@Inject( '$rootScope' ) private $rootScope: ng.IRootScopeService,
		@Inject( '$timeout' ) private $timeout: ng.ITimeoutService,
		@Inject( 'Screen' ) private screen: Screen,
		@Inject( 'Ruler' ) private ruler: Ruler
	)
	{
		this.recalculateDimensions();
		screen.setResizeSpy( $scope, () =>
		{
			// Wait till it renders before calculating.
			this.$timeout( () =>
			{
				this.recalculateDimensions();
			} );
		} );
	}

	ngOnChanges( changes: SimpleChanges )
	{
		let url;

		if ( changes['videoId'] ) {
			if ( this.videoProvider == 'youtube' ) {
				url = 'https://www.youtube.com/embed/' + this.videoId;
			}
			else if ( this.videoProvider == 'vimeo' ) {
				url = 'https://player.vimeo.com/video/' + this.videoId;
			}

			if ( this.autoplay ) {
				url += '?autoplay=1';
			}

			this.embedUrl = this.$sce.trustAsResourceUrl( url );
		}
	}

	recalculateDimensions()
	{
		this.width = this.ruler.width( this.$element[0].getElementsByClassName( 'video-embed-inner' )[0] );

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
