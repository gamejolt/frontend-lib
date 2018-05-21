import { AdSlot, AdSlotPos } from './slot';
import { loadScript } from '../../utils/utils';
import { BidsTimeout } from './ads.service';

interface AdUnitBid {
	bidder: string;
	params: any;
}

interface AdUnit {
	code: string;
	sizes: [number, number][];
	bids: AdUnitBid[];
}

interface AdPlacementVendorParam {
	pos: AdSlotPos;
	size: string;
	appNexus: object;
	ix: object;
	rubicon: object;
}

const AdPlacementVendorParams: AdPlacementVendorParam[] = [
	{
		pos: 'top',
		size: 'rectangle',
		appNexus: {
			placementId: '12095780',
		},
		ix: {
			siteID: '220482',
		},
		rubicon: {
			accountId: '17266',
			siteId: '160384',
			zoneId: '769840',
			position: 'atf',
		},
	},
	{
		pos: 'top',
		size: 'leaderboard',
		appNexus: {
			placementId: '12095779',
		},
		ix: {
			siteID: '220483',
		},
		rubicon: {
			accountId: '17266',
			siteId: '160384',
			zoneId: '769780',
			position: 'atf',
		},
	},
	{
		pos: 'bottom',
		size: 'rectangle',
		appNexus: {
			placementId: '12095790',
		},
		ix: {
			siteID: '220484',
		},
		rubicon: {
			accountId: '17266',
			siteId: '160384',
			zoneId: '769842',
			position: 'btf',
		},
	},
	{
		pos: 'bottom',
		size: 'leaderboard',
		appNexus: {
			placementId: '12095782',
		},
		ix: {
			siteID: '220485',
		},
		rubicon: {
			accountId: '17266',
			siteId: '160384',
			zoneId: '769822',
			position: 'btf',
		},
	},
	{
		pos: 'footer',
		size: 'rectangle',
		appNexus: {
			placementId: '12095977',
		},
		ix: {
			siteID: '220486',
		},
		rubicon: {
			accountId: '17266',
			siteId: '160384',
			zoneId: '769844',
			position: 'btf',
		},
	},
];

export class Prebid {
	private static isTagCreated = false;
	static forcedBidder?: string;

	private static get pbjs() {
		const _window = window as any;

		if (!_window.pbjs) {
			_window.pbjs = {};
		}

		if (!_window.pbjs.que) {
			_window.pbjs.que = [];
		}

		return _window.pbjs;
	}

	static makeAdUnitFromSlot(slot: AdSlot) {
		const placement = AdPlacementVendorParams.find(
			i => i.pos === slot.pos && i.size === slot.size
		);
		if (!placement) {
			throw new Error(`Couldn't get params for placement.`);
		}

		const unit = {
			code: slot.id,
			sizes: slot.slotSizes,
			bids: [
				{
					bidder: 'appnexus',
					params: placement.appNexus,
				},
				{
					bidder: 'ix',
					params: placement.ix,
				},
				{
					bidder: 'rubicon',
					params: placement.rubicon,
				},
			],
		};

		if (this.forcedBidder) {
			unit.bids = unit.bids.filter(i => i.bidder === this.forcedBidder);
		}

		return unit;
	}

	static getBids(adUnits: AdUnit[]) {
		return new Promise(resolve => {
			let wasHandled = false;
			const handleBids = (response: any) => {
				if (wasHandled) {
					return;
				}
				wasHandled = true;
				resolve(response);
			};

			this.run(() => {
				this.pbjs.requestBids({
					adUnits,
					bidsBackHandler: (response: any) => handleBids(response),
				});
			});
		});
	}

	private static run(cmd: Function) {
		this.createTag();
		this.pbjs.que.push(cmd);
	}

	private static createTag() {
		if (this.isTagCreated) {
			return;
		}
		this.isTagCreated = true;

		loadScript(require('!file-loader!./prebid.vendor.js'));

		if (GJ_BUILD_TYPE === 'production') {
			this.pbjs.que.push(() => {
				this.pbjs.enableAnalytics([
					{
						provider: 'ga',
						options: {},
					},
				]);
			});
		}

		this.pbjs.que.push(() => {
			this.pbjs.setConfig({
				bidderTimeout: BidsTimeout,
				publisherDomain: 'gamejolt.com',
			});
		});
	}
}
