import VueRouter from 'vue-router';
import { Environment } from '../environment/environment.service';
import { EventBus } from '../event-bus/event-bus.service';
import { objectEquals } from '../../utils/object';
import { AdSlot, AdSlotTargetingMap } from './slot';

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

	private static slots: AdSlot[] = [];

	/**
	 * These are slots that have been sent to the DFP tag and we get back a
	 * defined slot object.
	 */
	static definedSlots: any = {};

	private static globalTargeting: AdSlotTargetingMap = {};
	private static adUnit = DefaultAdUnit;
	private static ensurePromise: Promise<void> | null = null;

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
			if (!(window as any).googletag || !(window as any).googletag.pubads) {
				return;
			}

			// We want to clear any ads on the page every page change. This will
			// force a refresh of the ad slots to happen on next display/refresh
			// call. If we didn't do this then the slots would always show the
			// same exact ads.
			(window as any).googletag.pubads().clear();

			// Updating the correlator tells the service that a new page view
			// has ocurred.
			(window as any).googletag.pubads().updateCorrelator();
		});

		EventBus.on('routeChangeAfter', () => {
			if (!this.routeResolved) {
				this.routeResolved = true;

				// Broadcast an event so our ads know that a new page change
				// happened and they should refresh themselves. We do it this
				// way so that the logic of whether or not the states are a
				// match is preserved.
				EventBus.emit('$adsRefreshed');
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
		await this.ensure();
		this.googletag.cmd.push(() => {
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

	static async display(id: string) {
		if (GJ_BUILD_TYPE === 'development') {
			return;
		}

		await this.ensure();
		this.googletag.cmd.push(() => {
			this.googletag.display(id);
		});
	}

	static async refresh(id: string) {
		await this.ensure();
		this.googletag.cmd.push(() => {
			const definedSlot = this.definedSlots[id];
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
		this.googletag.cmd.push(() => {
			this.definedSlots[newSlot.id] = this.googletag
				.defineSlot(newSlot.adUnit, newSlot.slotSizes, newSlot.id)
				.addService(this.googletag.pubads());
		});

		return newSlot;
	}

	private static ensure() {
		if (!this.ensurePromise) {
			this.ensurePromise = new Promise<void>(async resolve => {
				await this.createTag();
				this.googletag.cmd.push(() => this.initServices());
				resolve();
			});
		}
		return this.ensurePromise;
	}

	private static createTag() {
		return new Promise(resolve => {
			const gads = document.createElement('script');
			const node = document.getElementsByTagName('script')[0] as HTMLScriptElement;

			gads.async = true;
			gads.type = 'text/javascript';
			gads.src = 'https://www.googletagservices.com/tag/js/gpt.js';

			node.parentNode!.insertBefore(gads, node);
			gads.onload = resolve;
		});
	}

	private static initServices() {
		// Don't enable single request mode, otherwise page impressions are
		// wrong when calling display/refresh in random spots on the page.
		this.googletag.enableServices();
	}
}
