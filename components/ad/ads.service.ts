import VueRouter from 'vue-router';
import { Environment } from '../environment/environment.service';
import { EventBus } from '../event-bus/event-bus.service';
import { objectEquals } from '../../utils/object';
import { AdSlot, AdSlotTargetingMap } from './slot';
import { AppAd } from './ad';
import { arrayRemove } from '../../utils/array';
import { Model } from '../model/model.service';
import { Game } from '../game/game.model';
import { makeObservableService } from '../../utils/vue';
import { Prebid } from './prebid.service';
import { Aps } from './aps.service';

// To show ads on the page for dev, just change this to true.
const DevDisabled = GJ_BUILD_TYPE === 'development';

// The timeout for any bid requests.
export const BidsTimeout = 2000;

const DfpTagId = '1437670388518';
const DfpNetworkId = '27005478';
const DefaultAdUnit = 'others';
const DfpAdUnitCodes = [
	'others',
	'homepage',
	'gamesdir',
	'gamepage',
	'devlogs',
	'devprofile',
	'forums',
	'search',
	'user',
];

export class Ads {
	static readonly EVENT_VIEW = 'view';
	static readonly EVENT_CLICK = 'click';

	static readonly TYPE_DISPLAY = 'display';
	static readonly TYPE_VIDEO = 'video';

	static readonly RESOURCE_TYPE_NONE = 1;
	static readonly RESOURCE_TYPE_GAME = 2;
	static readonly RESOURCE_TYPE_USER = 3;
	static readonly RESOURCE_TYPE_FIRESIDE_POST = 4;

	private static isTagCreated = false;
	private static ads: AppAd[] = [];
	private static slots: AdSlot[] = [];

	/**
	 * These are slots that have been sent to the DFP tag and we get back a
	 * defined slot object.
	 */
	static definedSlots: any = {};

	static isPageDisabled = false;
	static globalTargeting: AdSlotTargetingMap = {};
	static bidTargeting: { [k: string]: AdSlotTargetingMap } = {};
	static resource: Model | null = null;
	private static adUnit = DefaultAdUnit;
	private static routeResolved = false;

	private static get googletag() {
		// makeObservableService will call this, sadly.
		if (!this.shouldShow) {
			return null;
		}

		const _window = window as any;

		if (!_window.googletag) {
			_window.googletag = {};
		}

		if (!_window.googletag.cmd) {
			_window.googletag.cmd = [];
		}

		return _window.googletag;
	}

	static get shouldShow() {
		if (GJ_IS_CLIENT || GJ_IS_SSR) {
			return false;
		}

		if (this.isPageDisabled) {
			return false;
		}

		if (this.resource && this.resource instanceof Game && !this.resource._should_show_ads) {
			return false;
		}

		return true;
	}

	static init(router: VueRouter) {
		if (GJ_IS_SSR || GJ_IS_CLIENT) {
			return;
		}

		router.beforeEach((to, from, next) => {
			// Clear all our route-level settings.
			this.adUnit = DefaultAdUnit;
			this.globalTargeting = {};
			this.bidTargeting = {};
			this.resource = null;
			this.isPageDisabled = false;

			// Don't change ads if just the hash has changed.
			const fromParams = Object.assign({}, from.params, from.query);
			const toParams = Object.assign({}, to.params, to.query);

			if (to.name === from.name && objectEquals(fromParams, toParams)) {
				return next();
			}

			this.routeResolved = false;

			// No need to wait.
			next();

			// Only if DFP is already loaded in.
			if (!this.googletag.pubads) {
				return;
			}

			// We want to clear any ads on the page every page change. This will
			// force a refresh of the ad slots to happen on next display/refresh
			// call. If we didn't do this then the slots would always show the
			// same exact ads.
			this.googletag.pubads().clear();

			// Updating the correlator tells the service that a new page view
			// has ocurred.
			this.googletag.pubads().updateCorrelator();
		});

		EventBus.on('routeChangeAfter', () => {
			if (!this.routeResolved) {
				this.routeResolved = true;
				this.displayAds(this.ads);
			}
		});
	}

	static addAd(ad: AppAd) {
		this.ads.push(ad);

		// If the route already resolved then this ad was mounted after the
		// fact. We have to call the initial display.
		if (this.routeResolved) {
			this.displayAds([ad]);
		}
	}

	static removeAd(ad: AppAd) {
		arrayRemove(this.ads, i => i === ad);
	}

	static setAdUnit(adUnit: string) {
		if (DfpAdUnitCodes.indexOf(adUnit) === -1) {
			throw new Error(`Invalid ad unit code: ${adUnit}`);
		}

		this.adUnit = adUnit;
		return this;
	}

	static async setSlotTargeting(slot: AdSlot, targeting: AdSlotTargetingMap) {
		this.run(() => {
			const definedSlot = this.definedSlots[slot.id];
			if (definedSlot) {
				definedSlot.clearTargeting();
				Object.keys(targeting).forEach(k => {
					const val = targeting[k];
					if (!val || (Array.isArray(val) && val.length === 0)) {
						return;
					}

					definedSlot.setTargeting(k, targeting[k]);
				});
			}
		});
	}

	private static async displayAds(ads: AppAd[]) {
		// Copies the current set of ads so that it doesn't change during the async/await.
		const adsToDisplay = ads.map(i => i);

		if (!this.shouldShow) {
			return;
		}

		if (!adsToDisplay.length) {
			return;
		}

		for (const ad of adsToDisplay) {
			ad.refreshAdSlot();
		}

		if (!DevDisabled) {
			const prebidUnits = adsToDisplay.map(ad => Prebid.makeAdUnitFromSlot(ad.slot!));
			const apsSlots = adsToDisplay.map(ad => Aps.makeSlot(ad.slot!));

			const [prebidBids, apsBids] = await Promise.all([
				Prebid.getBids(prebidUnits),
				Aps.getBids(apsSlots),
			]);

			this.storeBidTargeting(prebidBids, apsBids);
		}

		this.run(() => {
			for (const ad of adsToDisplay) {
				ad.display();
			}
		});
	}

	static display(slot: AdSlot) {
		if (DevDisabled) {
			return;
		}

		this.run(() => {
			this.googletag.display(slot.id);
		});
	}

	static refresh(slot: AdSlot) {
		if (DevDisabled) {
			return;
		}

		this.run(() => {
			const definedSlot = this.definedSlots[slot.id];
			this.googletag.pubads().refresh([definedSlot], { changeCorrelator: false });
		});
	}

	static sendBeacon(event: string, type: string, resource?: string, resourceId?: number) {
		let queryString = '';

		// Cache busting.
		queryString += 'cb=' + Date.now();

		if (resource) {
			if (resource === 'Game') {
				queryString += '&resource_type=' + this.RESOURCE_TYPE_GAME;
				queryString += '&resource_id=' + resourceId;
			} else if (resource === 'User') {
				queryString += '&resource_type=' + this.RESOURCE_TYPE_USER;
				queryString += '&resource_id=' + resourceId;
			} else if (resource === 'Fireside_Post') {
				queryString += '&resource_type=' + this.RESOURCE_TYPE_FIRESIDE_POST;
				queryString += '&resource_id=' + resourceId;
			}
		}

		let path = '/adserver';
		if (event === Ads.EVENT_CLICK) {
			path += '/click';
		} else {
			path += `/log/${type}`;
		}

		// This is enough to send the beacon.
		// No need to add it to the page.
		let img = window.document.createElement('img');
		img.src = `${Environment.apiHost}${path}?${queryString}`;
	}

	static getUnusedAdSlot(size: 'rectangle' | 'leaderboard') {
		const adUnit = `/${DfpNetworkId}/${this.adUnit}`;

		// Try to reuse a slot.
		const slot = this.slots.find(i => i.adUnit === adUnit && i.size === size && !i.isUsed);
		if (slot) {
			return slot;
		}

		const id = `div-gpt-ad-${DfpTagId}-${this.slots.length}`;
		const newSlot = new AdSlot(adUnit, size, id);
		newSlot.isUsed = true;

		this.slots.push(newSlot);

		// Set the slot to register itself once the google tag is loaded.
		this.run(() => {
			this.definedSlots[newSlot.id] = this.googletag
				.defineSlot(newSlot.adUnit, newSlot.slotSizes, newSlot.id)
				.addService(this.googletag.pubads());

			this.googletag.enableServices();
		});

		return newSlot;
	}

	private static run(cmd: Function) {
		this.createTag();
		this.googletag.cmd.push(cmd);
	}

	private static createTag() {
		if (this.isTagCreated) {
			return;
		}
		this.isTagCreated = true;

		const gads = document.createElement('script');
		const node = document.getElementsByTagName('script')[0] as HTMLScriptElement;

		gads.async = true;
		gads.type = 'text/javascript';
		gads.src = 'https://www.googletagservices.com/tag/js/gpt.js';

		node.parentNode!.insertBefore(gads, node);

		// this.googletag.cmd.push(() => {
		// 	this.googletag.pubads().setForceSafeFrame(true);
		// });
	}

	private static storeBidTargeting(prebidBids: any, apsBids: any[]) {
		for (const slotId in prebidBids) {
			const bid = prebidBids[slotId].bids && prebidBids[slotId].bids[0];
			if (!bid) {
				continue;
			}

			this.addSlotBidTargeting(slotId, bid.adserverTargeting);
		}

		for (const bid of apsBids) {
			this.addSlotBidTargeting(bid.slotID, bid);
		}
	}

	private static addSlotBidTargeting(slotId: string, targeting: any) {
		this.bidTargeting[slotId] = this.bidTargeting[slotId] || {};
		Object.assign(this.bidTargeting[slotId], targeting);
	}
}

makeObservableService(Ads);
