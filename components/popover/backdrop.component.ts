import { Component, Output } from '@angular/core';

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
