import { Component, Input } from 'ng-metadata/core';
import template from 'html!./card.html';

@Component({
	selector: 'gj-card',
	template,
	legacy: {
		transclude: true,
	},
})
export class CardComponent
{
	@Input( '<?' ) isDraggable = false;
	@Input( '<?' ) isExpandable = false;
	@Input( '<?' ) isExpanded = false;
	@Input( '<?' ) isInactive = false;
	@Input( '<?' ) isDisabled = false;
}
