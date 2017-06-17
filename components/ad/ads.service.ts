import { Environment } from '../environment/environment.service';

export class Ads {
	static readonly TYPE_DISPLAY = 'display';
	static readonly TYPE_VIDEO = 'video';

	static readonly RESOURCE_TYPE_NONE = 1;
	static readonly RESOURCE_TYPE_GAME = 2;
	static readonly RESOURCE_TYPE_USER = 3;
	static readonly RESOURCE_TYPE_FIRESIDE_POST = 4;

	static isBootstrapped = false;
	static numActive = 0;
	static numLeaderboards = 0;
	static numRectangles = 0;
	static numSkyscrapers = 0;

	static sendBeacon(type: string, resource: string, resourceId: number) {
		if (Environment.isPrerender) {
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
}
