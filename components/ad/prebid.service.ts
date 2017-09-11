import { AdSlot } from './slot';
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

export class Prebid {
	private static isTagCreated = false;

	static get pbjs() {
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
		return {
			code: slot.id,
			sizes: slot.slotSizes,
			bids: [
				{
					bidder: 'appnexus',
					params: {
						placementId: '10433394',
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

	static setGptTargeting(codes: string[]) {
		this.run(() => {
			this.pbjs.setTargetingForGPTAsync(codes);
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

		const script = document.createElement('script');
		const node = document.getElementsByTagName('script')[0] as HTMLScriptElement;

		script.async = true;
		script.type = 'text/javascript';
		script.src = 'https://acdn.adnxs.com/prebid/not-for-prod/prebid.js';

		node.parentNode!.insertBefore(script, node);

		this.pbjs.que.push(() => {
			this.pbjs.setConfig({
				// debug: true,
				bidderTimeout: GetBidsTimeout,
				publisherDomain: 'https://gamejolt.com',
			});
		});
	}
}
