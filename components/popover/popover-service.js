angular.module( 'gj.Popover' ).service( 'Popover', function()
{
	this.popovers = {};

	this.registerPopover = function( id, popover )
	{
		this.popovers[id] = popover;
	};

	this.deregisterPopover = function( id )
	{
		delete this.popovers[id];
	};

	this.getPopover = function( id )
	{
		return this.popovers[id] || undefined;
	};

	this.hideAll = function( options )
	{
		options = options || {};
		var skip = options.skip || null;

		angular.forEach( this.popovers, function( popover )
		{
			if ( skip && skip.id === popover.id ) {
				return;
			}

			// If this is a manually triggered popover, skip it.
			if ( popover.triggerManually ) {
				return;
			}

			if ( popover.isShowing ) {
				popover.hide();
			}
		} );
	};
} );
