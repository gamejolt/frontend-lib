import { Directive, Inject, HostListener, Input } from 'ng-metadata/core';
import { Popover } from './popover.service';

@Directive({
	selector: 'gj-popover-trigger',
})
export class PopoverTriggerComponent
{
	@Input( '@gjPopoverTrigger' ) popoverId: string;
	@Input( '<' ) popoverTriggerDisabled = false;

	/**
	 * `click` will toggle it on/off when clicked.
	 * `hover` will show when moused over, and hide when moused out.
	 * `click-show` will only show when clicked and won't hide ever.
	 */
	@Input( '@' ) popoverTriggerEvent: 'click' | 'hover' | 'click-show' = 'click';

	constructor(
		@Inject( '$element' ) public $element: ng.IAugmentedJQuery,
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
		if ( [ 'click', 'click-show' ].indexOf( this.popoverTriggerEvent ) === -1
			|| this.popoverTriggerDisabled ) {
			return true;
		}

		const popover = this.getPopover();
		if ( popover ) {

			// First make sure all popovers currently showing are hidden.
			this.popoverService.hideAll( { skip: popover } );

			if ( this.popoverTriggerEvent === 'click' ) {

				// Trigger the popover.
				// Will either hide or show depending on its status.
				popover.trigger( this.$element );
			}
			else if ( this.popoverTriggerEvent === 'click-show' ) {
				popover.show( this.$element );
			}

			// Make sure this event doesn't bubble up to our global $document click event.
			// If we let it bubble, this popover will close.
			$event.stopPropagation();
		}
		else {
			return true;
		}
	}

	@HostListener( 'mouseenter' )
	onMouseEnter()
	{
		if ( this.popoverTriggerEvent !== 'hover' || this.popoverTriggerDisabled ) {
			return true;
		}

		const popover = this.getPopover();
		if ( popover ) {
			popover.attachedTrigger = this;
			popover.show( this.$element );
		}
	}

	@HostListener( 'mouseleave' )
	onMouseLeave()
	{
		if ( this.popoverTriggerEvent !== 'hover' || this.popoverTriggerDisabled ) {
			return true;
		}

		const popover = this.getPopover();
		if ( popover ) {
			popover.attachedTrigger = this;
			popover.hide();
		}
	}
}
