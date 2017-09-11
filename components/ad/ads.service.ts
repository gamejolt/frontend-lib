import VueRouter from 'vue-router';
import { Environment } from '../environment/environment.service';
import { EventBus } from '../event-bus/event-bus.service';
import { objectEquals } from '../../utils/object';
import { AdSlot, AdSlotTargetingMap } from './slot';
import { Prebid } from './prebid.service';
import { AppAd } from './ad';
import { arrayRemove } from '../../utils/array';

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

	private static globalTargeting: AdSlotTargetingMap = {};
	private static adUnit = DefaultAdUnit;

	static routeResolved = false;

	static get googletag() {
		const _window = window as any;

		if (!_window.googletag) {
			_window.googletag = {};
		}

		if (!_window.googletag.cmd) {
			_window.googletag.cmd = [];
		}

		return _window.googletag;
	}

	static init(router: VueRouter) {
		if (GJ_IS_SSR || GJ_IS_CLIENT) {
			return;
		}

		router.beforeEach((to, from, next) => {
			this.clearGlobalTargeting().clearAdUnit();

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

	private static async displayAds(ads: AppAd[]) {
		if (!ads.length) {
			return;
		}

		for (const ad of ads) {
			ad.refreshAdSlot();
		}

		const units = ads.map(ad => Prebid.makeAdUnitFromSlot(ad.slot!));
		console.log('made units', units);

		const bids = await Prebid.getBids(units);
		console.log('got bids', bids);

		this.run(() => {
			Prebid.setGptTargeting(Object.keys(bids));

			console.log('displaying ads');
			for (const ad of ads) {
				ad.display();
			}
		});
	}

	static setGlobalTargeting(targeting: AdSlotTargetingMap) {
		this.globalTargeting = targeting;
		return this;
	}

	static getGlobalTargeting() {
		return this.globalTargeting;
	}

	private static clearGlobalTargeting() {
		this.globalTargeting = {};
		return this;
	}

	static setAdUnit(adUnit: string) {
		if (DfpAdUnitCodes.indexOf(adUnit) === -1) {
			throw new Error(`Invalid ad unit code: ${adUnit}`);
		}

		this.adUnit = adUnit;
		return this;
	}

	static getAdUnit() {
		return `/${DfpNetworkId}/${this.adUnit}`;
	}

	private static clearAdUnit() {
		this.adUnit = DefaultAdUnit;
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

	static display(slot: AdSlot) {
		// if (GJ_BUILD_TYPE === 'development') {
		// 	return;
		// }

		this.run(() => {
			this.googletag.display(slot.id);
		});
	}

	static refresh(slot: AdSlot) {
		this.run(() => {
			const definedSlot = this.definedSlots[slot.id];
			this.googletag.pubads().refresh([definedSlot], { changeCorrelator: false });
		});
	}

	static sendBeacon(type: string, resource?: string, resourceId?: number) {
		if (GJ_IS_SSR) {
			return;
		}

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

		// This is enough to send the beacon.
		// No need to add it to the page.
		let img = window.document.createElement('img');
		img.src = `${Environment.apiHost}/adserver/log/${type}?${queryString}`;
	}

	static getUnusedAdSlot(size: 'rectangle' | 'leaderboard') {
		const adUnit = this.getAdUnit();

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
		// 	console.log('enable services');
		// 	// Don't load the ad calls initially. We will manually call
		// 	// display/refresh.
		// 	// TODO: Do we need this?
		// 	// this.googletag.pubads().disableInitialLoad();
	}
}
