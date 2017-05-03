import { Environment } from '../environment/environment.service';

const DfpTagId = '1437670388518';

export class AdSlot
{
	public isUsed = false;

	constructor(
		public adUnit: string,
		public sizes: [number, number ][],
		public id: string,
	)
	{
	}
}

export class Ads
{
	static readonly TYPE_DISPLAY = 'display';
	static readonly TYPE_VIDEO = 'video';

	static readonly RESOURCE_TYPE_NONE = 1;
	static readonly RESOURCE_TYPE_GAME = 2;
	static readonly RESOURCE_TYPE_USER = 3;
	static readonly RESOURCE_TYPE_FIRESIDE_POST = 4;

	static readonly TAG_SLOTS = [
		new AdSlot( '/27005478/web-display-leaderboard', [[728, 90], [970, 90]], `div-gpt-ad-${ DfpTagId }-10` ),
		new AdSlot( '/27005478/web-display-leaderboard', [[728, 90], [970, 90]], `div-gpt-ad-${ DfpTagId }-11` ),
		new AdSlot( '/27005478/web-display-leaderboard', [[728, 90], [970, 90]], `div-gpt-ad-${ DfpTagId }-12` ),
		new AdSlot( '/27005478/web-display-leaderboard', [[728, 90], [970, 90]], `div-gpt-ad-${ DfpTagId }-13` ),
		new AdSlot( '/27005478/web-display-leaderboard', [[728, 90], [970, 90]], `div-gpt-ad-${ DfpTagId }-14` ),

		new AdSlot( '/27005478/web-display-rectangle', [[300, 250], [300, 600]], `div-gpt-ad-${ DfpTagId }-20` ),
		new AdSlot( '/27005478/web-display-rectangle', [[300, 250], [300, 600]], `div-gpt-ad-${ DfpTagId }-21` ),
		new AdSlot( '/27005478/web-display-rectangle', [[300, 250], [300, 600]], `div-gpt-ad-${ DfpTagId }-22` ),
		new AdSlot( '/27005478/web-display-rectangle', [[300, 250], [300, 600]], `div-gpt-ad-${ DfpTagId }-23` ),
		new AdSlot( '/27005478/web-display-rectangle', [[300, 250], [300, 600]], `div-gpt-ad-${ DfpTagId }-24` ),
		new AdSlot( '/27005478/web-display-rectangle', [[300, 250], [300, 600]], `div-gpt-ad-${ DfpTagId }-25` ),
		new AdSlot( '/27005478/web-display-rectangle', [[300, 250], [300, 600]], `div-gpt-ad-${ DfpTagId }-26` ),
		new AdSlot( '/27005478/web-display-rectangle', [[300, 250], [300, 600]], `div-gpt-ad-${ DfpTagId }-27` ),
		new AdSlot( '/27005478/web-display-rectangle', [[300, 250], [300, 600]], `div-gpt-ad-${ DfpTagId }-28` ),
		new AdSlot( '/27005478/web-display-rectangle', [[300, 250], [300, 600]], `div-gpt-ad-${ DfpTagId }-29` ),
	];

	static sendBeacon( type: string, resource?: string, resourceId?: number )
	{
		if ( Environment.isPrerender ) {
			return;
		}

		let queryString = '';

		// Cache busting.
		queryString += 'cb=' + Date.now();

		if ( resource ) {
			if ( resource === 'Game' ) {
				queryString += '&resource_type=' + this.RESOURCE_TYPE_GAME;
				queryString += '&resource_id=' + resourceId;
			}
			else if ( resource === 'User' ) {
				queryString += '&resource_type=' + this.RESOURCE_TYPE_USER;
				queryString += '&resource_id=' + resourceId;
			}
			else if ( resource === 'Fireside_Post' ) {
				queryString += '&resource_type=' + this.RESOURCE_TYPE_FIRESIDE_POST;
				queryString += '&resource_id=' + resourceId;
			}
		}

		// This is enough to send the beacon.
		// No need to add it to the page.
		let img = window.document.createElement( 'img' );
		img.src = `${Environment.apiHost}/adserver/log/${type}?${queryString}`;
	}

	static getAdSlot( slotId: string )
	{
		return this.TAG_SLOTS.find( ( slot ) => slot.id === slotId );
	}

	static getUnusedAdSlot( size: 'rectangle' | 'leaderboard' )
	{
		const adUnit = size === 'rectangle'
			? '/27005478/web-display-rectangle'
			: '/27005478/web-display-leaderboard';

		return this.TAG_SLOTS.find( ( slot ) => slot.adUnit === adUnit && !slot.isUsed );
	}
}
