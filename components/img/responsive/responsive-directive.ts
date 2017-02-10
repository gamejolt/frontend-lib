import { Directive, Inject, Input, Output, OnChanges, SimpleChanges, EventEmitter } from 'ng-metadata/core';

import { Screen } from '../../screen/screen-service';
import { Ruler } from '../../ruler/ruler-service';
import { ImgHelper } from '../helper/helper-service';

const WIDTH_HEIGHT_REGEX = /\/(\d+)x(\d+)\//;
const WIDTH_REGEX = /\/(\d+)\//;

@Directive({
	selector: '[gj-img-responsive]',
})
export class ImgResponsiveDirective implements OnChanges
{
	@Input( '@gjImgResponsive' ) startSrc: string;

	@Output() private onLoadedChange = new EventEmitter<boolean>();

	element: HTMLImageElement;
	currentSrc: string;

	constructor(
		@Inject( '$element' ) $element: ng.IAugmentedJQuery,
		@Inject( '$scope' ) private $scope: ng.IScope,
	)
	{
		this.element = $element[0] as HTMLImageElement;
		this.element.classList.add( 'img-responsive' );

		Screen.setResizeSpy( $scope, () => this.updateSrc() );
	}

	ngOnChanges( changes: SimpleChanges )
	{
		if ( changes['startSrc'] ) {
			this.updateSrc();
		}
	}

	updateSrc()
	{
		this.$scope.$applyAsync( () =>
		{
			const containerWidth = Ruler.width( this.element.parentNode as HTMLElement );

			// Make sure we never do a 0 width, just in case.
			// Seems to happen in some situations.
			if ( containerWidth <= 0 ) {
				return;
			}

			// Update width in the URL.
			// We keep width within 100px increment bounds.
			let newSrc = this.startSrc;
			let mediaserverWidth = containerWidth;
			if ( Screen.isHiDpi ) {

				// For high dpi, double the width.
				mediaserverWidth = mediaserverWidth * 2;
				mediaserverWidth = Math.ceil( mediaserverWidth / 100 ) * 100;
			}
			else {
				mediaserverWidth = Math.ceil( mediaserverWidth / 100 ) * 100;
			}

			if ( newSrc.search( WIDTH_HEIGHT_REGEX ) !== -1 ) {
				newSrc = newSrc.replace( WIDTH_HEIGHT_REGEX, '/' + mediaserverWidth + 'x2000/' );
			}
			else {
				newSrc = newSrc.replace( WIDTH_REGEX, '/' + mediaserverWidth + '/' );
			}

			// Only if the src changed from previous runs.
			// They may be the same if the user resized the window but image container didn't change dimensions.
			if ( newSrc != this.element.src ) {
				this.element.src = newSrc;

				// Keep the isLoaded state up to date?
				this.onLoadedChange.emit( false );
				ImgHelper.loaded( newSrc )
					.then( () => this.onLoadedChange.emit( true ) );
			}
		} );
	}
}
