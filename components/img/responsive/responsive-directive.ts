import { Directive, Inject, Input, Output, OnChanges, SimpleChanges } from 'ng-metadata/core';
import { Screen } from './../../screen/screen-service';
import { Ruler } from './../../ruler/ruler-service';
import { ImgHelper } from './../helper/helper-service';

const WIDTH_HEIGHT_REGEX = /\/(\d+)x(\d+)\//;
const WIDTH_REGEX = /\/(\d+)\//;

@Directive({
	selector: '[gj-img-responsive]',
})
export class ResponsiveDirective implements OnChanges
{
	@Input( '@gjImgResponsive' ) startSrc: string;
	@Input( '<?imgResponsiveNoMediaserver' ) noMediaserver = false;
	@Input( '<?imgResponsiveWidth' ) width: number;
	@Input( '<?imgResponsiveHeight' ) height: number;

	@Output() onLoadedChange: Function;

	element: HTMLImageElement;
	currentSrc: string;

	constructor(
		@Inject( '$element' ) $element: angular.IAugmentedJQuery,
		@Inject( '$timeout' ) $timeout: angular.ITimeoutService,
		@Inject( '$scope' ) private $scope: angular.IScope,
		@Inject( 'Screen' ) private screen: Screen,
		@Inject( 'Ruler' ) private ruler: Ruler,
		@Inject( 'ImgHelper' ) private imgHelper: ImgHelper
	)
	{
		this.element = $element[0];
		this.element.classList.add( 'img-responsive' );

		screen.setResizeSpy( $scope, () => this.updateSrc() );
		screen.setResizeSpy( $scope, () => this.updateDimensions() );
	}

	ngOnChanges( changes: SimpleChanges )
	{
		if ( changes['startSrc'] || changes['noMediaserver'] ) {
			this.updateSrc();
		}

		if ( changes['width'] || changes['height'] ) {
			this.updateDimensions();
		}
	}

	updateSrc()
	{
		this.$scope.$applyAsync( () =>
		{
			const containerWidth = this.ruler.width( this.element.parentNode as HTMLElement );

			// Make sure we never do a 0 width, just in case.
			// Seems to happen in some situations.
			if ( containerWidth <= 0 ) {
				return;
			}

			// Update width in the URL.
			let newSrc = this.startSrc;
			if ( !this.noMediaserver ) {

				// We keep width within 100px increment bounds.
				let mediaserverWidth = containerWidth;
				if ( this.screen.isHiDpi ) {

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
			}

			// Only if the src changed from previous runs.
			// They may be the same if the user resized the window but image container didn't change dimensions.
			if ( newSrc != this.element.src ) {
				this.element.src = newSrc;

				// Keep the isLoaded state up to date?
				if ( this.onLoadedChange ) {
					this.onLoadedChange( { $loaded: false } );
					this.imgHelper.loaded( newSrc )
						.then( () => this.onLoadedChange( { $loaded: true } ) );
				}
			}
		} );
	}

	updateDimensions()
	{
		this.$scope.$applyAsync( () =>
		{
			const containerWidth = this.ruler.width( this.element.parentNode as HTMLElement );
			const newDimensions = this.imgHelper.getResizedDimensions( this.width, this.height, containerWidth, null );
			this.element.style.height = `${newDimensions.height}px`;
		} );
	}
}
