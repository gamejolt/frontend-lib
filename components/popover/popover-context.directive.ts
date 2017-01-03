import { Directive, Inject } from 'ng-metadata/core';

@Directive({
	selector: '[gj-popover-context]',
})
export class PopoverContextDirective
{
	constructor(
		@Inject( '$element' ) public $element: ng.IAugmentedJQuery,
	)
	{
	}
}
