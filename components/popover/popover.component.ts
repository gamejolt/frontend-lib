import { Component, Inject, OnInit, Input, Output, HostListener, SkipSelf, Optional, OnDestroy, EventEmitter } from 'ng-metadata/core';
import * as template from '!html-loader!./popover.component.html';

import { Popover } from './popover.service';
import { Ruler } from '../ruler/ruler-service';
import { Screen } from '../screen/screen-service';
import { PopoverTriggerComponent } from './popover-trigger.directive';
import { PopoverContextDirective } from './popover-context.directive';

interface PopoverTiggerEvent extends JQueryEventObject
{
	gjPopoverClick?: boolean;
}

@Component({
	selector: 'gj-popover',
	template,
	legacy: {
		transclude: true,
	}
})
export class PopoverComponent implements OnInit, OnDestroy
{
	@Input( '@popoverId' ) id: string;
	@Input( '<popoverAppendToBody' ) appendToBody = false;
	@Input( '<popoverTriggerManually' ) triggerManually = false;
	@Input( '@popoverPositionBy' ) positionBy?: 'position' | 'offset' | 'fixed';
	@Input( '@popoverTrackElementWidth' ) trackElementWidth?: string;
	@Input( '@popoverPosition' ) position: 'top' | 'right' | 'bottom' | 'left' = 'bottom';
	@Input( '@popoverPositionHorizontal' ) positionHorizontal?: string;
	@Input( '<popoverHideOnStateChange' ) hideOnStateChange = false;

	@Output( 'popoverOnFocus' ) private focused = new EventEmitter<void>();
	@Output( 'popoverOnBlur' ) private blurred = new EventEmitter<void>();

	isVisible = false;
	isAppendedToBody = false;

	private transitioning: 'enter' | 'leave' | false = false;

	attachedTrigger?: PopoverTriggerComponent;

	private originalParent: ng.IAugmentedJQuery;
	private backdropElemCompiled?: ng.IAugmentedJQuery;
	private hideDeregister?: any;

	constructor(
		@Inject( '$element' ) private $element: ng.IAugmentedJQuery,
		@Inject( '$scope' ) private $scope: ng.IScope,
		@Inject( '$animate' ) private $animate: ng.animate.IAnimateService,
		@Inject( '$position' ) private $position: any,
		@Inject( '$window' ) private $window: ng.IWindowService,
		@Inject( '$document' ) private $document: ng.IDocumentService,
		@Inject( '$rootScope' ) private $rootScope: ng.IRootScopeService,
		@Inject( '$compile' ) private $compile: ng.ICompileService,
		@Inject( '$timeout' ) private $timeout: ng.ITimeoutService,
		@Inject( 'Popover' ) private popoverService: Popover,
		@Inject( 'Scroll' ) private scroll: any,
		@Inject( 'Screen' ) public screen: Screen,
		@Inject( '[gj-popover-context]' ) @SkipSelf() @Optional() private context: PopoverContextDirective,
	)
	{
		this.originalParent = this.$element.parent() as ng.IAugmentedJQuery;
	}

	// If we are attached to an on "hover" trigger, then we want need to make
	// sure to show the popover if they leave the trigger and move their mouse
	// into the popover. This way it won't hide when they move to use the
	// popover.
	@HostListener( 'mouseenter' )
	onMouseEnter()
	{
		if ( this.attachedTrigger && this.attachedTrigger.popoverTriggerEvent === 'hover' ) {
			this.show( this.attachedTrigger.$element );
		}
	}

	@HostListener( 'mouseleave' )
	onMouseLeave()
	{
		if ( this.attachedTrigger && this.attachedTrigger.popoverTriggerEvent === 'hover' ) {
			this.hide();
		}
	}

	/**
	 * Register a click handler on the element to stop it from propagating
	 * to the $document click handler that closes all popovers.
	 */
	@HostListener( 'click', [ '$event' ] )
	onClick( event: PopoverTiggerEvent)
	{
		// We set that this event originated from a popover click.
		// This will tell our global document handler that is set when the popover is showing
		// to not hide popovers.
		event.gjPopoverClick = true;

		return true;
	}

	ngOnInit()
	{
		this.$element.addClass( 'popover' );

		// Track this popover.
		this.popoverService.registerPopover( this.id, this );
	}

	ngOnDestroy()
	{
		// There is some times a race condition when we reload a page where it re-registers the popover for the view
		// before we have a chance to deregister the old one.
		// We check to make sure that the ID referenced is this exact popover controller, otherwise we skip the deregistration
		// since it was already overriden and effectively deregistered.
		if ( this.popoverService.getPopover( this.id ) === this ) {
			this.popoverService.deregisterPopover( this.id );
		}

		// Gotta make sure to clean up after itself complete.
		// This includes the popover backdrop and what not.
		// Passing true will set the element to remove itself from the DOM now that we're done with it.
		// This ensures that even if the popover is appended to the body, if the scope it was attached to is destroyed,
		// it's still cleaned up.
		this.hide( true );
	}

	// We use the wrapped to generate an on/off click handler.
	private hidePopoversWrapped?: any;

	private hidePopovers( event?: PopoverTiggerEvent )
	{
		// This attribute is set on click events that originate within an actual popover.
		// We don't want to close them when this happens.
		// We only close if it was clicked outside of the popover.
		if ( event && event.gjPopoverClick ) {
			return;
		}

		this.$rootScope.$apply( () => this.popoverService.hideAll() );
	}

	/**
	 * Toggle this popover.
	 */
	trigger( triggerElement: ng.IAugmentedJQuery )
	{
		if ( !this.isVisible ) {
			this.show( triggerElement );
		}
		else {
			this.hide();
		}
	}

	/**
	 * Show the popover and enter it into the DOM.
	 */
	show( triggerElement: ng.IAugmentedJQuery )
	{
		// If leaving we want to stop the leave and override it with the show.
		if ( this.isVisible && this.transitioning !== 'leave' ) {
			return;
		}

		this.transitioning = 'enter';
		this.isVisible = true;

		this.focused.emit( undefined );

		// Add the correct direction class.
		this.$element.removeClass( 'left top right bottom' ).addClass( this.position );

		// Should it be appended to the body instead of where it lives currently?
		// We check this every time we need to show.
		if ( this.appendToBody && !this.isAppendedToBody ) {
			this.$document.find( 'body' ).append( this.$element );
			this.isAppendedToBody = true;
		}
		else if ( !this.appendToBody && this.isAppendedToBody ) {
			this.originalParent.append( this.$element );
			this.isAppendedToBody = false;
		}

		const elem = this.$element[0];

		const triggerWidth = triggerElement[0].offsetWidth;
		const triggerHeight = triggerElement[0].offsetHeight;
		const triggerOffset = this.$position.offset( triggerElement );

		// If we are tracking a particular element's width, then we set this popover to
		// be the same width as the element.
		// We don't track width when it's an XS screen since we do a full width popover in those cases.
		let widthElem: HTMLElement | undefined;
		if ( this.trackElementWidth && !this.screen.isWindowXs ) {
			widthElem = this.$document[0].querySelector( this.trackElementWidth ) as HTMLElement | undefined;
			if ( widthElem ) {
				elem.style.width = widthElem.offsetWidth + 'px';
				elem.style.maxWidth = 'none';
			}
		}

		// If no element to base our width on, reset.
		if ( !widthElem ) {
			elem.style.maxWidth = '';
			elem.style.width = '';
		}

		const popoverWidth = Ruler.outerWidth( elem );
		const popoverHeight = Ruler.outerHeight( elem );

		// If we're appending to body, then we're positioning it relative to the whole screen.
		// If we're keeping it in place, then we position relative to the parent positioner.
		// We allow to override this logic through a param, though.
		const positionBy = this.positionBy || (this.appendToBody ? 'offset' : 'position');

		let triggerLeft: number, triggerTop: number, triggerRight: number, triggerBottom: number;
		if ( positionBy === 'offset' ) {
			triggerLeft = triggerOffset.left;
			triggerTop = triggerOffset.top;
		}
		else if ( positionBy === 'fixed' ) {
			triggerLeft = triggerOffset.left - this.scroll.context.duScrollLeft();
			triggerTop = triggerOffset.top - this.scroll.context.duScrollTop();
		}
		else {
			const triggerPos = this.$position.position( triggerElement );
			triggerLeft = triggerPos.left;
			triggerTop = triggerPos.top;
		}

		triggerRight = triggerLeft + triggerWidth;
		triggerBottom = triggerTop + triggerHeight;

		if ( positionBy === 'fixed' ) {
			elem.style.position = 'fixed';
		}
		else {
			elem.style.position = 'absolute';
		}

		if ( this.position === 'top' || this.position === 'bottom' ) {

			// Align to the right if the trigger is past the window mid line.
			// Always go by the trigger offset.
			if ( this.positionHorizontal === 'left' || triggerOffset.left > (this.screen.windowWidth / 2) ) {
				elem.style.left = triggerRight - popoverWidth + 'px';
			}
			else {
				elem.style.left = triggerLeft + 'px';
			}

			if ( this.position === 'bottom' ) {
				elem.style.top = triggerBottom + 'px';
			}
			else if ( this.position === 'top' ) {
				elem.style.bottom = triggerTop + 'px';
			}
		}
		else if ( this.position === 'left' || this.position === 'right' ) {

			// Align to the right if the trigger is past the window mid line.
			if ( triggerTop > (this.screen.windowHeight / 2) ) {
				elem.style.top = triggerBottom - popoverHeight + 'px';
			}
			else {
				elem.style.top = triggerTop + 'px';
			}

			if ( this.position === 'left' ) {
				elem.style.right = triggerLeft + 'px';
			}
			else if ( this.position === 'right' ) {
				elem.style.left = triggerRight + 'px';
			}
		}

		// Align the arrow to match the center of the trigger element.
		// Unless the popover is smaller than the element, then we align to center of popover.
		// The extra spacing is for the popover element around the edges.
		// If we want to position the arrow correctly, we need to subtract half of this.
		const elementStyles = this.$window.getComputedStyle( elem );
		const arrowElem = elem.getElementsByClassName( 'arrow' )[0] as HTMLElement | undefined;
		if ( arrowElem ) {
			if ( this.position === 'top' || this.position === 'bottom' ) {
				const extraSpacing = elementStyles.left ? ((popoverWidth - Ruler.width( elem )) / 2) + parseFloat( elementStyles.left ) : 0;
				arrowElem.style.left = triggerLeft + Math.min( triggerWidth / 2, popoverWidth / 2 ) - extraSpacing + 'px';
			}
			else if ( this.position === 'left' || this.position === 'right' ) {
				const extraSpacing = elementStyles.top ? ((popoverHeight - Ruler.height( elem )) / 2) + parseFloat( elementStyles.top ) : 0;
				arrowElem.style.top = triggerTop + Math.min( triggerHeight / 2, popoverHeight / 2 ) - extraSpacing + 'px';
			}
		}

		this.$animate.addClass( this.$element, 'active' );

		this.hidePopoversWrapped = ( event: JQueryEventObject ) => this.hidePopovers( event );
		this.$document.on( 'click', this.hidePopoversWrapped );

		const backdropElem = angular.element( '<gj-popover-backdrop hide="$ctrl.hide()"></gj-popover-backdrop>' );
		this.backdropElemCompiled = this.$compile( backdropElem )( this.$scope );

		if ( this.context ) {
			this.context.$element.append( this.backdropElemCompiled );
		}
		else {
			this.$document.find( 'body' ).append( this.backdropElemCompiled );
		}

		// If we need to hide it on state change as well.
		if ( this.hideOnStateChange && !this.hideDeregister ) {
			this.hideDeregister = this.$scope.$on( '$stateChangeStart', () =>
			{
				this.popoverService.hideAll();
			} );
		}

		this.transitioning = false;
	}

	/**
	 * Hide this element and possibly remove from the DOM.
	 */
	async hide( shouldRemove = false )
	{
		if ( !this.isVisible ) {
			return;
		}

		this.transitioning = 'leave';

		// We give it a short timeout for anything to cancel the transition.
		// Basically, if "show" is called within this time, we'll stop the
		// leave transition and show it.
		await this.$timeout( 100 );

		if ( this.transitioning !== 'leave' ) {
			return;
		}

		if ( this.hidePopoversWrapped ) {
			this.$document.off( 'click', this.hidePopoversWrapped );
		}

		if ( this.backdropElemCompiled ) {
			this.backdropElemCompiled.remove();
		}

		// If we're hiding on state change as well.
		if ( this.hideOnStateChange && this.hideDeregister ) {
			this.hideDeregister();
			this.hideDeregister = undefined;
		}

		await this.$animate.removeClass( this.$element, 'active' );

		if ( this.transitioning !== 'leave' ) {
			return;
		}

		// We only call onBlur _after_ it has animated out.
		this.blurred.emit( undefined );

		if ( shouldRemove ) {
			this.$element.remove();
		}

		this.isVisible = false;
		this.transitioning = false;
	}
}
