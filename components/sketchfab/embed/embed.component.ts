import { Component, Input, Inject, OnChanges, SimpleChanges } from 'ng-metadata/core';
import { Ruler } from '../../ruler/ruler-service';
import { Screen } from '../../screen/screen-service';
import * as template from '!html-loader!./embed.component.html';

const RATIO = 0.5625;  // 16:9

@Component({
	selector: 'gj-sketchfab-embed',
	template,
})
export class SketchfabEmbedComponent implements OnChanges
{
	@Input() sketchfabId: string;
	@Input() maxWidth: number;
	@Input() maxHeight: number;
	@Input() autoplay = false;

	embedUrl: string;
	width: number;
	height: number;

	constructor(
		@Inject( '$scope' ) $scope: any,
		@Inject( '$element' ) private $element: any,
		@Inject( '$sce' ) private $sce: ng.ISCEService,
		@Inject( '$timeout' ) private $timeout: ng.ITimeoutService,
		@Inject( 'Screen' ) screen: Screen,
		@Inject( 'Ruler' ) private ruler: Ruler,
	)
	{
		this.$timeout( () => this.recalculateDimensions() );

		screen.setResizeSpy( $scope, () =>
		{
			// Wait till it renders before calculating.
			this.$timeout( () => this.recalculateDimensions() );
		} );
	}

	ngOnChanges( changes: SimpleChanges )
	{
		console.log( this.autoplay );
		if ( changes['sketchfabId'] ) {
			let url = `https://sketchfab.com/models/${this.sketchfabId}/embed`;

			if ( this.autoplay ) {
				url += '?autostart=1';
			}

			this.embedUrl = this.$sce.trustAsResourceUrl( url );
		}
	}

	recalculateDimensions()
	{
		this.width = this.ruler.width( this.$element[0].getElementsByClassName( 'sketchfab-embed-inner' )[0] );

		if ( this.maxWidth ) {
			this.width = Math.min( this.maxWidth, this.width );
		}

		this.height = this.width * RATIO;

		if ( this.maxHeight && this.height > this.maxHeight ) {
			this.height = this.maxHeight;
			this.width = this.height / RATIO;
		}
	}
}
