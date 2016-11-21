import { Directive, Inject, HostListener, Input } from 'ng-metadata/core';
import { Popover } from './popover.service';

@Directive({
	selector: 'gj-popover-trigger',
})
export class PopoverTriggerComponent
{
	@Input( '@gjPopoverTrigger' ) popoverId: string;
	@Input( '@?' ) popoverTriggerEvent: 'click' | 'hover' = 'click';
	@Input( '<' ) popoverTriggerDisabled = false;

	constructor(
		@Inject( '$element' ) private $element: ng.IAugmentedJQuery,
		@Inject( 'Popover' ) private popoverService: Popover,
	)
	{
	}

	getPopover()
	{
		return this.popoverService.getPopover( this.popoverId );
	}

	@HostListener( 'click', [ '$event' ] )
	onClick( $event: JQueryEventObject )
	{
		if ( this.popoverTriggerEvent != 'click' || this.popoverTriggerDisabled ) {
			return;
		}

		const popover = this.getPopover();
		if ( popover ) {

			// First make sure all popovers currently showing are hidden.
			this.popoverService.hideAll( { skip: popover } );

			// Trigger the popover.
			// Will either hide or show depending on its status.
			popover.trigger( this.$element );

			// Make sure this event doesn't bubble up to our global $document click event.
			// If we let it bubble, this popover will close.
			$event.stopPropagation();
		}
	}

	@HostListener( 'mouseenter' )
	onMouseEnter()
	{
		if ( this.popoverTriggerEvent != 'hover' || this.popoverTriggerDisabled ) {
			return;
		}

		const popover = this.getPopover();
		if ( popover ) {
			popover.show( this.$element );
		}
	}

	@HostListener( 'mouseleave' )
	onMouseLeave()
	{
		if ( this.popoverTriggerEvent != 'hover' || this.popoverTriggerDisabled ) {
			return;
		}

		const popover = this.getPopover();
		if ( popover ) {
			this.popoverService.hideAll();
		}
	}
}
