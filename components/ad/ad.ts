import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./ad.html?style=./ad.styl';

import { Ads } from './ads.service';
import { Environment } from '../environment/environment.service';

let _globalTagId = '1437670388518';
let _isBootstrapped = false;

if (!GJ_IS_SSR) {
}

function _bootstrapAds() {
	const _window = window as any;

	// _window.googletag = {};  // We always start from scratch on every bootstrap.
	_window.googletag = _window.googletag || {};
	_window.googletag.cmd = _window.googletag.cmd || [];

	_window.googletag.cmd.push(function() {
		_window.googletag
			.defineSlot(
				'/27005478/web-display-leaderboard',
				[[728, 90], [970, 90]],
				'div-gpt-ad-' + _globalTagId + '-10'
			)
			.addService(_window.googletag.pubads());

		_window.googletag
			.defineSlot(
				'/27005478/web-display-leaderboard',
				[[728, 90], [970, 90]],
				'div-gpt-ad-' + _globalTagId + '-11'
			)
			.addService(_window.googletag.pubads());

		_window.googletag
			.defineSlot(
				'/27005478/web-display-leaderboard',
				[[728, 90], [970, 90]],
				'div-gpt-ad-' + _globalTagId + '-12'
			)
			.addService(_window.googletag.pubads());

		_window.googletag
			.defineSlot(
				'/27005478/web-display-leaderboard',
				[[728, 90], [970, 90]],
				'div-gpt-ad-' + _globalTagId + '-13'
			)
			.addService(_window.googletag.pubads());

		_window.googletag
			.defineSlot(
				'/27005478/web-display-rectangle',
				[[300, 250], [300, 600]],
				'div-gpt-ad-' + _globalTagId + '-20'
			)
			.addService(_window.googletag.pubads());

		_window.googletag
			.defineSlot(
				'/27005478/web-display-rectangle',
				[[300, 250], [300, 600]],
				'div-gpt-ad-' + _globalTagId + '-21'
			)
			.addService(_window.googletag.pubads());

		_window.googletag
			.defineSlot(
				'/27005478/web-display-160x600',
				[160, 600],
				'div-gpt-ad-' + _globalTagId + '-30'
			)
			.addService(_window.googletag.pubads());

		_window.googletag
			.defineSlot(
				'/27005478/web-display-160x600',
				[160, 600],
				'div-gpt-ad-' + _globalTagId + '-31'
			)
			.addService(_window.googletag.pubads());

		_window.googletag.enableServices();
	});

	if (_isBootstrapped) {
		// console.log( window.googletag );
		(window as any).googletag.pubads().updateCorrelator();
		(window as any).googletag.pubads().refresh();
		return;
	}

	_isBootstrapped = true;

	const gads = document.createElement('script');
	gads.id = 'ads-script-bootsrapper';
	gads.async = true;
	gads.type = 'text/javascript';
	gads.src = 'https://www.googletagservices.com/tag/js/gpt.js';

	const node = document.getElementsByTagName('script')[0];
	node.parentNode!.insertBefore(gads, node);
}

function _cleanupAds() {
	console.log('cleaning up');
	_isBootstrapped = false;

	const _window = window as any;
	if (_window.googletag.pubads) {
		_window.googletag.destroySlots();
	}

	// let oldScript = null;
	// if ( oldScript = document.getElementById( 'ads-script-bootsrapper' ) ) {
	// 	oldScript.parentNode!.removeChild( oldScript );
	// }
}

@View
@Component({})
export class AppAd extends Vue {
	@Prop(String) size: string;
	@Prop(String) resource: string;
	@Prop(Number) resourceId: number;

	adId = 0;
	globalTagId = _globalTagId;

	mounted() {
		return;
		++Ads.numActive;

		// Send the beacon saying that we've viewed this ad.
		Ads.sendBeacon(Ads.TYPE_DISPLAY, this.resource, this.resourceId);

		if (this.size === 'leaderboard') {
			this.adId = 10 + Ads.numLeaderboards;
			++Ads.numLeaderboards;
		} else if (this.size === 'rectangle') {
			this.adId = 20 + Ads.numRectangles;
			++Ads.numRectangles;
		} else if (this.size === 'skyscraper') {
			this.adId = 30 + Ads.numSkyscrapers;
			++Ads.numSkyscrapers;
		}

		// Don't do anything if we're just prerendering the page.
		if (Environment.isPrerender) {
			return;
		}

		const adElem = this.$el.querySelector('.ad-inner');
		if (!adElem) {
			return;
		}

		const googlePlaceholderElem = document.createElement('div');
		googlePlaceholderElem.id =
			'div-gpt-ad-' + this.globalTagId + '-' + this.adId;
		adElem.appendChild(googlePlaceholderElem);

		if (GJ_ENVIRONMENT === 'production' && !GJ_IS_CLIENT) {
			if (Ads.numActive === 1) {
				_bootstrapAds();
			}

			const scriptElem = document.createElement('script');
			scriptElem.type = 'text/javascript';
			scriptElem.text = `googletag.cmd.push(function() { googletag.display('div-gpt-ad-${this
				.globalTagId}-${this.adId}'); });`;
			googlePlaceholderElem.appendChild(scriptElem);
		}
	}

	destroyed() {
		return;
		--Ads.numActive;

		if (this.size === 'leaderboard') {
			--Ads.numLeaderboards;
		} else if (this.size === 'rectangle') {
			--Ads.numRectangles;
		} else if (this.size === 'skyscraper') {
			--Ads.numSkyscrapers;
		}

		// If we have no more active ads clean up the ad code.
		// It should mean that we switched pages.
		if (Ads.numActive <= 0) {
			_cleanupAds();
		}
	}
}
