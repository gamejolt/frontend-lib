import { AdSlot, AdSlotPos } from './slot';
import { loadScript } from '../../utils/utils';
const GetBidsTimeout = 700;

interface AdUnitBid {
	bidder: string;
	params: any;
}

interface AdUnit {
	code: string;
	sizes: [number, number][];
	bids: AdUnitBid[];
}

interface AppNexusPlacement {
	pos: AdSlotPos;
	size: string;
	id: string;
}

const AppNexusPlacements: AppNexusPlacement[] = [
	{
		pos: 'top',
		size: 'rectangle',
		id: '12095780',
	},
	{
		pos: 'top',
		size: 'leaderboard',
		id: '12095779',
	},
	{
		pos: 'bottom',
		size: 'rectangle',
		id: '12095790',
	},
	{
		pos: 'bottom',
		size: 'leaderboard',
		id: '12095782',
	},
	{
		pos: 'footer',
		size: 'rectangle',
		id: '12095977',
	},
];

export class Prebid {
	private static isTagCreated = false;

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
		const placement = AppNexusPlacements.find(i => i.pos === slot.pos && i.size === slot.size);

		return {
			code: slot.id,
			sizes: slot.slotSizes,
			bids: [
				{
					bidder: 'appnexus',
					params: {
						placementId: (placement && placement.id) || '12085509',
					},
				},
			],
		};
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
				bidderTimeout: GetBidsTimeout,
				publisherDomain: 'https://gamejolt.com',
			});
		});
	}
}
