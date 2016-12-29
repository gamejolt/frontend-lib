import { Component, Inject, OnInit, Input, Output } from '@angular/core';
import template from 'html!./popover.component.html';
import { Popover } from './popover.service';
import { Ruler } from '../ruler/ruler-service';
import { Screen } from '../screen/screen-service';

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
export class PopoverComponent implements OnInit
{
	@Input( '@popoverId' ) id: string;
	@Input( '<?popoverAppendToBody' ) appendToBody = false;
	@Input( '<?popoverTriggerManually' ) triggerManually = false;
	@Input( '@?popoverPositionBy' ) positionBy?: 'position' | 'offset';
	@Input( '@?popoverTrackElementWidth' ) trackElementWidth?: string;
	@Input( '@?popoverPositionHorizontal' ) positionHorizontal?: string;
	@Input( '<?popoverHideOnStateChange' ) hideOnStateChange = false;

	@Output( '?popoverOnFocus' ) private focused: Function;
	@Output( '?popoverOnBlur' ) private blurred: Function;

	isShowing = false;
	isAppendedToBody = false;

	private originalParent: ng.IAugmentedJQuery;
	private backdropElemCompiled?: ng.IAugmentedJQuery;
	private hideDeregister?: any;

	constructor(
		@Inject( '$element' ) private $element: ng.IAugmentedJQuery,
		@Inject( '$scope' ) private $scope: ng.IScope,
		@Inject( '$q' ) private $q: ng.IQService,
		@Inject( '$animate' ) private $animate: ng.animate.IAnimateService,
		@Inject( '$position' ) private $position: any,
		@Inject( '$window' ) private $window: ng.IWindowService,
		@Inject( '$document' ) private $document: ng.IDocumentService,
		@Inject( '$rootScope' ) private $rootScope: ng.IRootScopeService,
		@Inject( '$compile' ) private $compile: ng.ICompileService,
		@Inject( 'Popover' ) private popoverService: Popover,
		@Inject( 'Ruler' ) private ruler: Ruler,
		@Inject( 'Screen' ) public screen: Screen,
	)
	{
		this.originalParent = this.$element.parent();
	}

	ngOnInit()
	{
		this.$element.addClass( 'popover bottom' );

		// Track this popover.
		this.popoverService.registerPopover( this.id, this );

		/**
		 * Register a click handler on the element to stop it from propagating
		 * to the $document click handler that closes all popovers.
		 */
		this.$element.on( 'click', ( event: PopoverTiggerEvent ) =>
		{
			// We set that this event originated from a popover click.
			// This will tell our global document handler that is set when the popover is showing
			// to not hide popovers.
			event.gjPopoverClick = true;
		} );

		// Deregister the popover when the scope it was attached to is destroyed.
		this.$scope.$on( '$destroy', () =>
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
		} );
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
		if ( !this.isShowing ) {
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
		if ( this.isShowing ) {
			return;
		}

		// A promise can be returned in the show function to delay until the popover content
		// has been processed and ready to show.
		let showPromise: any;
		if ( this.focused ) {
			showPromise = this.focused( {} );
		}

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

		return this.$q.when( showPromise ).then( () =>
		{
			const elem = this.$element[0];

			const triggerWidth = triggerElement[0].offsetWidth;
			const triggerHeight = triggerElement[0].offsetHeight;

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

			const popoverWidth = this.ruler.outerWidth( elem );
			const triggerOffset = this.$position.offset( triggerElement );

			// If we're appending to body, then we're positioning it relative to the whole screen.
			// If we're keeping it in place, then we position relative to the parent positioner.
			// We allow to override this logic through a param, though.
			const positionBy = this.positionBy || (this.appendToBody ? 'offset' : 'position');

			let left: number, top: number;
			if ( positionBy == 'offset' ) {
				left = triggerOffset.left;
				top = triggerOffset.top;
			}
			else {
				const triggerPos = this.$position.position( triggerElement );
				left = triggerPos.left;
				top = triggerPos.top;
			}

			// Align to the right if the trigger is past the window mid line.
			if ( this.positionHorizontal == 'left' || triggerOffset.left > (this.screen.windowWidth / 2) ) {
				elem.style.left = left - popoverWidth + triggerWidth + 'px';
				elem.style.top = top + triggerHeight + 'px';
			}
			else {
				elem.style.left = left + 'px';
				elem.style.top = top + triggerHeight + 'px';
			}

			// This is the extra spacing for the popover element around the edges.
			// If we want to position the arrow correctly, we need to subtract half of this.
			const elementStyles = this.$window.getComputedStyle( elem );
			const extraSpacing = elementStyles.left ? ((popoverWidth - this.ruler.width( elem )) / 2) + parseFloat( elementStyles.left ) : 0;

			// Align the arrow to match the center of the trigger element.
			// Unless the popover is smaller than the element, then we align to center of popover.
			const arrowElem = elem.getElementsByClassName( 'arrow' )[0] as HTMLElement | undefined;
			if ( arrowElem ) {
				arrowElem.style.left = left + Math.min( triggerWidth / 2, (popoverWidth / 2) ) - extraSpacing + 'px';
			}

			this.$animate.addClass( this.$element, 'active' );
			this.isShowing = true;

			this.hidePopoversWrapped = ( event: JQueryEventObject ) => this.hidePopovers( event );
			this.$document.on( 'click', this.hidePopoversWrapped );

			const backdropElem = angular.element( '<gj-popover-backdrop hide="$ctrl.hide()"></gj-popover-backdrop>' );
			this.backdropElemCompiled = this.$compile( backdropElem )( this.$scope );
			this.$document.find( 'body' ).append( this.backdropElemCompiled );

			// If we need to hide it on state change as well.
			if ( this.hideOnStateChange && !this.hideDeregister ) {
				this.hideDeregister = this.$scope.$on( '$stateChangeStart', () =>
				{
					this.popoverService.hideAll();
				} );
			}
		} );
	}

	/**
	 * Hide this element and possibly remove from the DOM.
	 */
	hide( shouldRemove = false )
	{
		if ( !this.isShowing ) {
			return;
		}

		this.isShowing = false;

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

		return this.$animate.removeClass( this.$element, 'active' )
			.then( () =>
			{
				// We only call onBlur _after_ it has animated out.
				if ( this.blurred ) {
					return this.blurred( {} );
				}
			} )
			.then( () =>
			{
				if ( shouldRemove ) {
					this.$element.remove();
				}
			} );
	}
}
