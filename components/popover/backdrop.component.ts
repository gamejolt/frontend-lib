import { Component, Output, EventEmitter } from 'ng-metadata/core';

@Component({
	selector: 'gj-popover-backdrop',
	template: `
		<div class="popover-backdrop" ng-click="$ctrl.hide()"></div>
	`,
})
export class PopoverBackdropComponent
{
	@Output() private _hide = new EventEmitter<void>();

	hide()
	{
		this._hide.emit( undefined );
	}
}
