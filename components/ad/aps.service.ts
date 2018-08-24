import { AdSlot } from './slot';
import { BidsTimeout } from './ads.service';

interface ApsSlot {
	slotID: string;
	slotName: string;
	sizes: [number, number][];
}

export class Aps {
	private static isTagCreated = false;

	private static get apstag() {
		const _window = window as any;
		return _window.apstag;
	}

	static makeSlot(slot: AdSlot): ApsSlot {
		return {
			slotID: slot.id,
			slotName: slot.adUnit,
			sizes: slot.slotSizes,
		};
	}

	static getBids(slots: ApsSlot[]): Promise<any[]> {
		this.createTag();

		return new Promise(resolve => {
			this.apstag.fetchBids(
				{
					slots,
					timeout: BidsTimeout,
				},
				(response: any) => resolve(response)
			);
		});
	}

	static getTargetingKeys(): string[] {
		if (!this.isTagCreated) {
			throw new Error(`Called before tag created.`);
		}

		return this.apstag.targetingKeys();
	}

	private static createTag() {
		if (this.isTagCreated) {
			return;
		}
		this.isTagCreated = true;

		// tslint:disable:no-unused-expression
		// tslint:disable:curly
		// FROM AMAZON
		!(function(a9: any, a: any, p: any, s: any, t: any) {
			if (a[a9]) return;

			function q(c: any, r: any) {
				a[a9]._Q.push([c, r]);
			}
			a[a9] = {
				init: function() {
					q('i', arguments);
				},
				fetchBids: function() {
					q('f', arguments);
				},
				setDisplayBids: function() {},
				targetingKeys: function() {
					return [];
				},
				_Q: [],
			};
			const A = p.createElement(s);
			A.async = !0;
			A.src = t;
			const g = p.getElementsByTagName(s)[0];
			g.parentNode.insertBefore(A, g);
		})('apstag', window, document, 'script', 'https://c.amazon-adsystem.com/aax2/apstag.js');
		// END FROM AMAZON
		// tslint:enable:no-unused-expression
		// tslint:enable:curly

		this.apstag.init({
			pubID: '78dcb131-6f52-468a-84dc-e9840b75724f',
			adServer: 'googletag',
		});
	}
}
