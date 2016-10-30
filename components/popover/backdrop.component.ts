import { Component, Output } from 'ng-metadata/core';

@Component({
	selector: 'gj-popover-backdrop',
	template: `
		<div class="popover-backdrop" ng-click="$ctrl.hide()"></div>
	`,
})
export class PopoverBackdropComponent
{
	@Output() hide: Function;
}
