angular.module( 'gj.Popover' ).directive( 'gjPopover', function( $q, $animate, $position, $window, $document, $rootScope, $compile, Popover, Ruler, Screen )
{
	function hidePopovers( event )
	{
		// This attribute is set on click events that originate within an actual popover.
		// We don't want to close them when this happens.
		// We only close if it was clicked outside of the popover.
		if ( event && event.gjPopoverClick ) {
			return;
		}

		$rootScope.$apply( function()
		{
			Popover.hideAll();
		} );
	}

	var definition = {
		transclude: true,
		templateUrl: '/lib/gj-lib-client/components/popover/popover.html',
		scope: {
			id: '@popoverId',
			appendToBody: '=?popoverAppendToBody',
			triggerManually: '=?popoverTriggerManually',
			positionBy: '@?popoverPositionBy',  // To allow to force positioning by "position" or "offset".
			trackElementWidth: '@?popoverTrackElementWidth',
			onFocus: '&?popoverOnFocus',
			onBlur: '&?popoverOnBlur',
			hideOnStateChange: '=?popoverHideOnStateChange',
			positionHorizontal: '@?popoverPositionHorizontal',
		},
		compile: function( element )
		{
			element.addClass( 'popover bottom' );
		},
		bindToController: true,
		controllerAs: 'ctrl',
		controller: [ '$scope', '$element', PopoverCtrl ],
	};

	function PopoverCtrl( $scope, $element )
	{
		var _this = this;

		$scope.Screen = Screen;

		this.$scope = $scope;
		this.$element = $element;
		this.isShowing = false;
		this.originalParent = this.$element.parent();
		this.isAppendedToBody = false;
		this.backdropElemCompiled = null;
		this.hideDeregister = null;

		// Track this popover.
		Popover.registerPopover( this.id, this );

		/**
		 * Deregister the popover when the scope it was attached to is destroyed.
		 */
		$scope.$on( '$destroy', function()
		{
			// There is some times a race condition when we reload a page where it re-registers the popover for the view
			// before we have a chance to deregister the old one.
			// We check to make sure that the ID referenced is this exact popover controller, otherwise we skip the deregistration
			// since it was already overriden and effectively deregistered.
			if ( Popover.getPopover( _this.id ) === _this ) {
				Popover.deregisterPopover( _this.id );
			}

			// Gotta make sure to clean up after itself complete.
			// This includes the popover backdrop and what not.
			// Passing true will set the element to remove itself from the DOM now that we're done with it.
			// This ensures that even if the popover is appended to the body, if the scope it was attached to is destroyed,
			// it's still cleaned up.
			_this.hide( true );
		} );

		/**
		 * Register a click handler on the element to stop it from propagating
		 * to the $document click handler that closes all popovers.
		 */
		this.$element.on( 'click', function( event )
		{
			// We set that this event originated from a popover click.
			// This will tell our global document handler that is set when the popover is showing
			// to not hide popovers.
			event.gjPopoverClick = true;
		} );
	}

	/**
	 * Toggle this popover.
	 */
	PopoverCtrl.prototype.trigger = function( triggerElement )
	{
		if ( !this.isShowing ) {
			this.show( triggerElement );
		}
		else {
			this.hide();
		}
	};

	/**
	 * Show the popover and enter it into the DOM.
	 * @param {element} The element that triggered the show.
	 */
	PopoverCtrl.prototype.show = function( triggerElement )
	{
		var _this = this;

		if ( this.isShowing ) {
			return;
		}

		// A promise can be returned in the show function to delay until the popover content
		// has been processed and ready to show.
		var showPromise = null;
		if ( this.onFocus ) {
			showPromise = this.onFocus( {} );
		}

		// Should it be appended to the body instead of where it lives currently?
		// We check this every time we need to show.
		if ( this.appendToBody && !this.isAppendedToBody ) {
			$document.find( 'body' ).append( this.$element );
			this.isAppendedToBody = true;
		}
		else if ( !this.appendToBody && this.isAppendedToBody ) {
			this.originalParent.append( this.$element );
			this.isAppendedToBody = false;
		}

		return $q.when( showPromise ).then( function()
		{
			var popoverElem = _this.$element[0];

			var triggerWidth = triggerElement[0].offsetWidth;
			var triggerHeight = triggerElement[0].offsetHeight;

			// If we are tracking a particular element's width, then we set this popover to
			// be the same width as the element.
			// We don't track width when it's an XS screen since we do a full width popover in those cases.
			var widthElem = false;
			if ( _this.trackElementWidth && !Screen.isWindowXs ) {
				widthElem = $document[0].querySelector( _this.trackElementWidth );
				if ( widthElem ) {
					popoverElem.style.width = widthElem.offsetWidth + 'px';
					popoverElem.style.maxWidth = 'none';
				}
			}

			// If no element to base our width on, reset.
			if ( !widthElem ) {
				popoverElem.style.maxWidth = '';
				popoverElem.style.width = '';
			}

			var popoverWidth = Ruler.outerWidth( popoverElem );

			// If we're appending to body, then we're positioning it relative to the whole screen.
			// If we're keeping it in place, then we position relative to the parent positioner.
			// We allow to override this logic through a param, though.
			var positionBy = _this.positionBy || (_this.appendToBody ? 'offset' : 'position');

			var left, top;
			var triggerOffset = $position.offset( triggerElement );
			if ( positionBy == 'offset' ) {
				left = triggerOffset.left;
				top = triggerOffset.top;
			}
			else {
				var triggerPos = $position.position( triggerElement );
				left = triggerPos.left;
				top = triggerPos.top;
			}

			// Align to the right if the trigger is past the window mid line.
			if ( _this.positionHorizontal == 'left' || triggerOffset.left > (Screen.windowWidth / 2) ) {
				popoverElem.style.left = left - popoverWidth + triggerWidth + 'px';
				popoverElem.style.top = top + triggerHeight + 'px';
			}
			else {
				popoverElem.style.left = left + 'px';
				popoverElem.style.top = top + triggerHeight + 'px';
			}

			// This is the extra spacing for the popover element around the edges.
			// If we want to position the arrow correctly, we need to subtract half of this.
			var elementStyles = $window.getComputedStyle( popoverElem );
			var extraSpacing = ((popoverWidth - Ruler.width( popoverElem )) / 2) + parseFloat( elementStyles.left );

			// Align the arrow to match the center of the trigger element.
			// Unless the popover is smaller than the element, then we align to center of popover.
			var arrowElem = popoverElem.getElementsByClassName( 'arrow' )[0];
			arrowElem.style.left = left + Math.min( triggerWidth / 2, (popoverWidth / 2) ) - extraSpacing + 'px';

			$animate.addClass( _this.$element, 'active' );
			_this.isShowing = true;

			$document.on( 'click', hidePopovers );

			var backdropElem = angular.element( '<div gj-popover-backdrop></div>' );
			_this.backdropElemCompiled = $compile( backdropElem )( _this.$scope );
			$document.find( 'body' ).append( _this.backdropElemCompiled );

			// If we need to hide it on state change as well.
			if ( _this.hideOnStateChange && !_this.hideDeregister ) {
				_this.hideDeregister = _this.$scope.$on( '$stateChangeStart', function()
				{
					Popover.hideAll();
				} );
			}
		} );
	};

	/**
	 * Hide this element and remove from the DOM.
	 */
	PopoverCtrl.prototype.hide = function( shouldRemove )
	{
		var _this = this;

		if ( !this.isShowing ) {
			return;
		}

		this.isShowing = false;

		$document.off( 'click', hidePopovers );
		this.backdropElemCompiled.remove();

		// If we're hiding on state change as well.
		if ( _this.hideOnStateChange && _this.hideDeregister ) {
			_this.hideDeregister();
			_this.hideDeregister = null;
		}

		return $animate.removeClass( _this.$element, 'active' )
			.then( function()
			{
				// We only call onBlur _after_ it has animated out.
				if ( _this.onBlur ) {
					return _this.onBlur( {} );
				}
			} )
			.then( function()
			{
				if ( shouldRemove ) {
					_this.$element.remove();
				}
			} );
	};

	return definition;
} );
