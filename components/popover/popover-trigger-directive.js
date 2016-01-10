angular.module( 'gj.Popover' ).directive( 'gjPopoverTrigger', function( Popover, $interpolate )
{
	return {
		restrict: 'A',
		link: function( scope, element, attrs )
		{
			element.on( 'click', function( event )
			{
				scope.$apply( function()
				{
					var popoverCtrl = Popover.getPopover( $interpolate( attrs.gjPopoverTrigger )( scope ) );
					if ( popoverCtrl ) {

						// First make sure all popovers currently showing are hidden.
						Popover.hideAll( { skip: popoverCtrl } );

						// Trigger the popover.
						// Will either hide or show depending on its status.
						popoverCtrl.trigger( element );

						// Make sure this event doesn't bubble up to our global $document click event.
						// If we let it bubble, this popover will close.
						event.stopPropagation();
					}
				} );
			} );
		}
	};
} );
