import { Injectable, Inject } from 'ng-metadata/core';
import { PartnerReferral } from '../partner-referral/partner-referral-service';
import { Environment } from '../environment/environment.service';
import { Device } from '../device/device.service';

export interface BeaconOptions
{
	sourceResource?: string;
	sourceResourceId?: number;
	key?: string;
}

@Injectable( 'HistoryTick' )
export class HistoryTick
{
	private _sources: { [key: string]: string } = {};

	constructor(
		@Inject( 'Referrer' ) private referrer: any,
		@Inject( 'PartnerReferral' ) private partnerReferral: PartnerReferral,
	)
	{
	}

	/**
	 * You can track a source for a particular parent resource.
	 * For example, tracking the current referrer for a Game and then any time
	 * you log a tick for a type within that Game (game-build, game-news, etc)
	 * it will pull the source referrer into the tick.
	 *
	 * Note that we only log the first referrer for a particular resource.
	 * If you get to this resource through different means we'll still just
	 * track the initial way of getting there.
	 */
	trackSource( resource: string, resourceId: number )
	{
		// Look specifically for undefined and not just null.
		// There may have been a null referrer if we got here through a direct page hit.
		if ( angular.isUndefined( this._sources[ resource + ':' + resourceId ] ) ) {
			this._sources[ resource + ':' + resourceId ] = this.referrer.get();
		}
	}

	getSource( resource: string, resourceId: number )
	{
		return this._sources[ resource + ':' + resourceId ];
	}

	sendBeacon( type: string, resourceId: number, options: BeaconOptions = {} )
	{
		if ( Environment.isPrerender ) {
			return;
		}

		return new Promise( ( resolve ) =>
		{
			const queryParams: string[] = [];

			// Cache busting.
			queryParams.push( 'cb=' + Date.now() );

			// Device info.
			queryParams.push( 'os=' + Device.os() );
			const arch = Device.arch();
			if ( arch ) {
				queryParams.push( 'arch=' + arch );
			}

			// Source/referrer.
			if ( options.sourceResource && options.sourceResourceId ) {
				const source = this.getSource( options.sourceResource, options.sourceResourceId );
				if ( source ) {
					queryParams.push( 'source=' + source );
				}

				const ref = this.partnerReferral.getReferrer( options.sourceResource, options.sourceResourceId );
				if ( ref ) {
					queryParams.push( 'ref=' + ref );
				}
			}

			// Key.
			if ( options.key ) {
				queryParams.push( 'key=' + options.key );
			}

			// This is enough to send the beacon.
			// No need to add it to the page.
			const img = window.document.createElement( 'img' );
			img.width = 1;
			img.height = 1;
			img.src = `${Environment.apiHost}/tick/${type}/${resourceId}?${queryParams.join( '&' )}`;

			// Always resolve.
			img.onload = img.onerror = () =>
			{
				delete img.onload;
				delete img.onerror;
				resolve();
			};

			if ( Environment.env == 'development' ) {
				console.log( 'Tracking history tick.', {
					type: type,
					resourceId: resourceId,
					queryString: queryParams.join( '&' ),
				} );
			}
		} );
	}
}
