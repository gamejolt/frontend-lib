import { Directive, Inject, Input, OnChanges, SimpleChanges } from 'ng-metadata/core';
import { Screen } from './../screen/screen-service';
import { Ruler } from './../ruler/ruler-service';

@Directive({
	selector: '[gj-responsive-dimensions]',
})
export class ResponsiveDimensionsDirective implements OnChanges
{
	@Input( '<responsiveDimensionsRatio' ) ratio: number;

	element: HTMLImageElement;

	constructor(
		@Inject( '$element' ) $element: ng.IAugmentedJQuery,
		@Inject( '$scope' ) $scope: ng.IScope,
		@Inject( 'Screen' ) screen: Screen,
		@Inject( 'Ruler' ) private ruler: Ruler,
	)
	{
		this.element = $element[0] as HTMLImageElement;
		screen.setResizeSpy( $scope, () => this.updateDimensions() );
	}

	ngOnChanges( changes: SimpleChanges )
	{
		if ( changes['ratio'] ) {
			this.updateDimensions();
		}
	}

	private updateDimensions()
	{
		const containerWidth = this.ruler.width( this.element.parentNode as HTMLElement );
		this.element.style.height = `${containerWidth / this.ratio}px`;
	}
}
