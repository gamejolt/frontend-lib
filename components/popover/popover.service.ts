import { Injectable } from '@angular/core';
import { PopoverComponent } from './popover.component';

@Injectable()
export class Popover
{
	popovers: { [k: string]: PopoverComponent } = {};

	registerPopover( id: string, popover: PopoverComponent )
	{
		this.popovers[ id ] = popover;
	}

	deregisterPopover( id: string )
	{
		delete this.popovers[ id ];
	}

	getPopover( id: string )
	{
		return this.popovers[ id ] || undefined;
	}

	hideAll( options: { skip?: PopoverComponent } = {} )
	{
		angular.forEach( this.popovers, function( popover )
		{
			if ( options.skip && options.skip.id === popover.id ) {
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
	}
}
