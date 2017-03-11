import { AppPopover } from './popover';

export class Popover
{
	static popovers: { [k: string]: AppPopover } = {};

	static registerPopover( id: string, popover: AppPopover )
	{
		this.popovers[ id ] = popover;
	}

	static deregisterPopover( id: string )
	{
		delete this.popovers[ id ];
	}

	static getPopover( id: string )
	{
		return this.popovers[ id ] || undefined;
	}

	static hideAll( options: { skip?: AppPopover } = {} )
	{
		for ( const popover of Object.values( this.popovers ) ) {
			if ( options.skip && options.skip.popoverId === popover.popoverId ) {
				continue;
			}

			// If this is a manually triggered popover, skip it.
			if ( popover.triggerManually ) {
				continue;
			}

			if ( popover.isVisible ) {
				popover.hide();
			}
		}
	}
}
