import { AppPopover } from './popover';
import { getProvider } from '../../utils/utils';

export class Popover {
	static popovers: { [k: string]: AppPopover } = {};
	static stateChangeRegistered = false;

	static registerPopover(router: any, id: string, popover: AppPopover) {
		this.popovers[id] = popover;

		// Have to do this because we still use angular. Once we switch off we
		// can do this outside the class.
		if (!this.stateChangeRegistered) {
			this.stateChangeRegistered = true;

			if (router) {
				router.beforeEach((_to: any, _from: any, next: Function) => {
					this.hideStateChange();
					next();
				});
			}

			if (GJ_IS_ANGULAR) {
				getProvider<any>('$rootScope').$on('$stateChangeStart', () =>
					this.hideStateChange()
				);
			}
		}
	}

	static deregisterPopover(id: string) {
		delete this.popovers[id];
	}

	static getPopover(id: string) {
		return this.popovers[id] || undefined;
	}

	static hideAll(options: { skip?: AppPopover } = {}) {
		for (const popover of Object.values(this.popovers)) {
			if (options.skip && options.skip.popoverId === popover.popoverId) {
				continue;
			}

			// If this is a manually triggered popover, skip it.
			if (popover.triggerManually) {
				continue;
			}

			if (popover.isVisible) {
				popover.hide();
			}
		}
	}

	static hideStateChange() {
		for (const popover of Object.values(this.popovers)) {
			if (popover.isVisible && popover.hideOnStateChange) {
				popover.hide();
			}
		}
	}
}
