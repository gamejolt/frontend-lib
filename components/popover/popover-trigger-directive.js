angular.module( 'gj.Popover' ).directive( 'gjPopoverTrigger', function( Popover, $interpolate )
{
	return {
		restrict: 'A',
		link: function( scope, element, attrs )
		{
			function getPopover()
			{
				return Popover.getPopover( $interpolate( attrs.gjPopoverTrigger )( scope ) );
			}

			if ( !attrs.popoverTriggerEvent || attrs.popoverTriggerEvent == 'click' ) {
				element.on( 'click', function( event )
				{
					scope.$apply( function()
					{
						var popover = getPopover();
						if ( popover ) {

							// First make sure all popovers currently showing are hidden.
							Popover.hideAll( { skip: popover } );

							// Trigger the popover.
							// Will either hide or show depending on its status.
							popover.trigger( element );

							// Make sure this event doesn't bubble up to our global $document click event.
							// If we let it bubble, this popover will close.
							event.stopPropagation();
						}
					} );
				} );
			}
			else if ( attrs.popoverTriggerEvent == 'hover' ) {
				element.on( 'mouseenter', function( event )
				{
					scope.$apply( function()
					{
						var popover = getPopover();
						if ( popover ) {
							popover.show( element );
						}
					} );
				} );

				element.on( 'mouseleave', function( event )
				{
					scope.$apply( function()
					{
						var popover = getPopover();
						if ( popover ) {
							Popover.hideAll();
						}
					} );
				} );
			}
		}
	};
} );
