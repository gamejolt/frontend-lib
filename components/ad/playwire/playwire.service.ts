// Load in the CMP stuff.
import { AdsDisabledDev } from 'game-jolt-frontend-lib/components/ad/ads.service';
import { AppAdPlaywire } from 'game-jolt-frontend-lib/components/ad/playwire/playwire';
import { EventBus } from 'game-jolt-frontend-lib/components/event-bus/event-bus.service';
import { loadScript } from 'game-jolt-frontend-lib/utils/utils';
import VueRouter from 'vue-router';
import '../cmp.service';

export class Playwire {
	private static isInitialized = false;
	private static routeResolved = false;
	private static ads: Set<AppAdPlaywire> = new Set();

	static async init(router: VueRouter) {
		if (GJ_IS_CLIENT || GJ_IS_SSR || AdsDisabledDev) {
			return;
		}

		if (this.isInitialized) {
			return;
		}
		this.isInitialized = true;

		// We set up events so that we know when a route begins and when the
		// routing is fully resolved.
		router.beforeEach((_to, _from, next) => {
			this.routeResolved = false;
			next();
		});

		EventBus.on('routeChangeAfter', () => {
			this.routeResolved = true;
			this.displayAds(Array.from(this.ads));
		});

		(window as any).tyche = {
			mode: 'tyche',
			config: 'https://config.playwire.com/1391/v2/websites/30391/banner.json',
			observerMode: {
				enabled: true,
				selector: 'root',
			},
		};

		try {
			console.log('Attempting to load playwire.', (window as any).tyche);
			await loadScript('https://cdn.intergi.com/hera/tyche.js');
		} catch (e) {
			console.error('Caught error trying to load playwire.', e);
		}
	}

	static addAd(ad: AppAdPlaywire) {
		this.ads.add(ad);

		// If the route already resolved then this ad was mounted after the
		// fact. We have to call the initial display.
		if (this.routeResolved) {
			this.displayAds([ad]);
		}
	}

	static removeAd(ad: AppAdPlaywire) {
		this.ads.delete(ad);
	}

	private static async displayAds(ads: AppAdPlaywire[]) {
		if (!ads.length || !this.isInitialized) {
			return;
		}

		for (const ad of ads) {
			ad.display();
		}
	}
}
