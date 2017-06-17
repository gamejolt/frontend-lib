import {
	Directive,
	Inject,
	Input,
	OnInit,
	Host,
	OnDestroy,
} from 'ng-metadata/core';

@Directive({
	selector: '[gj-colorpicker]',
})
export class ColorpickerDirective implements OnInit, OnDestroy {
	@Input('<gjColorpicker') options: any;

	private jqElem: any;

	constructor(
		@Inject('$window') private $window: ng.IWindowService,
		@Inject('$element') private $element: ng.IAugmentedJQuery,
		@Inject('$scope') private $scope: ng.IScope,
		@Inject('ngModel')
		@Host()
		private ngModel: ng.INgModelController,
	) {}

	ngOnInit() {
		this.jqElem = this.$window.jQuery(this.$element[0]);

		// Gather the initial options for Spectrum.
		const initialOptions = angular.extend(
			{
				color: this.ngModel.$viewValue,
				preferredFormat: 'hex6',
				showInitial: true,
				showInput: true,
				change: (color: any) => {
					this.$scope.$apply(() => {
						// Any time sepctrum changes, we want to update the model attached to it.
						this.ngModel.$setViewValue(color ? color.toHexString() : '');
					});
				},
			},
			this.options,
		);

		// Load it up with the initial options.
		this.jqElem.spectrum(initialOptions);

		// Using ngModel.$render wasn't working.
		this.$scope.$watch(
			() => this.ngModel.$modelValue,
			(val: string) => {
				this.jqElem.spectrum('set', val || '');
			},
		);

		// This allows us to make the input options dynamic.
		// Any time an input option changes, we want to update Spectrum with the new options.
		this.$scope.$watch('inputOptions', (newVal, oldVal) => {
			// Only update if it's changed.
			// newVal and oldVal will be the same if it's the initial load.
			// This is good since we want the above options input to handle that case.
			if (!angular.equals(newVal, oldVal)) {
				this.jqElem.spectrum(newVal);
			}
		});
	}

	ngOnDestroy() {
		this.jqElem.spectrum('destroy');
	}
}
