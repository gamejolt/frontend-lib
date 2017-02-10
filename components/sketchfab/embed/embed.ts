import * as Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import * as View from '!view!./embed.html';

import { Ruler } from '../../ruler/ruler-service';
import { Screen } from '../../screen/screen-service';

const RATIO = 0.5625; // 16:9

@View
@Component({
	name: 'sketchfab-embed',
})
export class AppSketchfabEmbed extends Vue
{
	@Prop() sketchfabId: string;
	@Prop() maxWidth: number;
	@Prop() maxHeight: number;
	@Prop( { default: false } ) autoplay: boolean;

	embedUrl = '';
	width = 0;
	height = 0;

	mounted()
	{
		this.$nextTick( () => this.recalculateDimensions() );
	}

	@Watch( 'sketchfabId', { immediate: true } )
	idChange()
	{
		if ( !this.sketchfabId ) {
			return;
		}

		let url = `https://sketchfab.com/models/${this.sketchfabId}/embed`;

		if ( this.autoplay ) {
			url += '?autostart=1';
		}

		this.embedUrl = url;
	}

	recalculateDimensions()
	{
		this.width = Ruler.width( this.$el.getElementsByClassName( 'sketchfab-embed-inner' )[0] as HTMLElement );

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

/*
@Component({
	selector: 'gj-sketchfab-embed',
	template,
})
export class SketchfabEmbedComponent implements OnChanges
{
	constructor(
		@Inject( '$scope' ) $scope: any,
		@Inject( '$element' ) private $element: any,
		@Inject( '$sce' ) private $sce: ng.ISCEService,
		@Inject( '$timeout' ) private $timeout: ng.ITimeoutService,
	)
	{
		Screen.setResizeSpy( $scope, () =>
		{
			// Wait till it renders before calculating.
			this.$timeout( () => this.recalculateDimensions() );
		} );
	}
}
*/
