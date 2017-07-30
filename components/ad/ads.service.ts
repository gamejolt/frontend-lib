import { Environment, isPrerender } from '../environment/environment.service';
import { EventBus } from '../event-bus/event-bus.service';

const DfpTagId = '1437670388518';

export class AdSlot {
	public isUsed = false;

	constructor(public adUnit: string, public sizes: [number, number][], public id: string) {}
}

export class Ads {
	static readonly TYPE_DISPLAY = 'display';
	static readonly TYPE_VIDEO = 'video';

	static readonly RESOURCE_TYPE_NONE = 1;
	static readonly RESOURCE_TYPE_GAME = 2;
	static readonly RESOURCE_TYPE_USER = 3;
	static readonly RESOURCE_TYPE_FIRESIDE_POST = 4;

	static readonly TAG_SLOTS = [
		new AdSlot('/27005478/web-display-leaderboard', [[728, 90]], `div-gpt-ad-${DfpTagId}-10`),
		new AdSlot('/27005478/web-display-leaderboard', [[728, 90]], `div-gpt-ad-${DfpTagId}-11`),
		new AdSlot('/27005478/web-display-leaderboard', [[728, 90]], `div-gpt-ad-${DfpTagId}-12`),
		new AdSlot('/27005478/web-display-leaderboard', [[728, 90]], `div-gpt-ad-${DfpTagId}-13`),
		new AdSlot('/27005478/web-display-leaderboard', [[728, 90]], `div-gpt-ad-${DfpTagId}-14`),

		new AdSlot('/27005478/web-display-rectangle', [[300, 250]], `div-gpt-ad-${DfpTagId}-20`),
		new AdSlot('/27005478/web-display-rectangle', [[300, 250]], `div-gpt-ad-${DfpTagId}-21`),
		new AdSlot('/27005478/web-display-rectangle', [[300, 250]], `div-gpt-ad-${DfpTagId}-22`),
		new AdSlot('/27005478/web-display-rectangle', [[300, 250]], `div-gpt-ad-${DfpTagId}-23`),
		new AdSlot('/27005478/web-display-rectangle', [[300, 250]], `div-gpt-ad-${DfpTagId}-24`),
		new AdSlot('/27005478/web-display-rectangle', [[300, 250]], `div-gpt-ad-${DfpTagId}-25`),
		new AdSlot('/27005478/web-display-rectangle', [[300, 250]], `div-gpt-ad-${DfpTagId}-26`),
		new AdSlot('/27005478/web-display-rectangle', [[300, 250]], `div-gpt-ad-${DfpTagId}-27`),
		new AdSlot('/27005478/web-display-rectangle', [[300, 250]], `div-gpt-ad-${DfpTagId}-28`),
		new AdSlot('/27005478/web-display-rectangle', [[300, 250]], `div-gpt-ad-${DfpTagId}-29`),
	];

	/**
	 * These are slots that have been sent to the DFP tag and we get back a
	 * defined slot object.
	 */
	static definedSlots: any = {};

	private static ensurePromise: Promise<void> | null = null;

	static get googletag() {
		return (window as any).googletag;
	}

	static init() {
		if (GJ_IS_SSR || GJ_IS_CLIENT || isPrerender) {
			return;
		}

		EventBus.on('routeChangeAfter', () => {
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

			// Broadcast an event so our ads know that a new page change
			// happened and they should refresh themselves. We do it this way so
			// that the logic of whether or not the states are a match is
			// preserved.
			EventBus.emit('$adsRefreshed');
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

	static async refreshSlots(slots: AdSlot[]) {
		await this.ensure();
		this.googletag.cmd.push(() => {
			const definedSlots = slots.map(slot => this.definedSlots[slot.id]);
			this.googletag.pubads().refresh(definedSlots, { changeCorrelator: false });
		});
	}

	static sendBeacon(type: string, resource?: string, resourceId?: number) {
		if (Environment.isPrerender || GJ_IS_SSR) {
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

	static getAdSlot(slotId: string) {
		return this.TAG_SLOTS.find(slot => slot.id === slotId);
	}

	static getUnusedAdSlot(size: 'rectangle' | 'leaderboard') {
		const adUnit =
			size === 'rectangle'
				? '/27005478/web-display-rectangle'
				: '/27005478/web-display-leaderboard';

		return this.TAG_SLOTS.find(slot => slot.adUnit === adUnit && !slot.isUsed);
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

		this.TAG_SLOTS.forEach(slot => {
			this.definedSlots[slot.id] = this.googletag
				.defineSlot(slot.adUnit, slot.sizes, slot.id)
				.addService(this.googletag.pubads());
		});

		this.googletag.enableServices();
	}
}
