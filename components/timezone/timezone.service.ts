import { Injectable } from 'ng-metadata/core';
import { Api } from '../api/api.service';

@Injectable( 'Timezone' )
export class Timezone
{
	private timezonesFetch: any;

	getTimezones()
	{
		if ( !this.timezonesFetch ) {

			// Raw request (ignore most payload stuff).
			const options = {
				withCredentials: false,
				detach: true,
				processPayload: false,
			};

			this.timezonesFetch = Api.sendRequest( '/jams/manage/jams/get-timezones', null, options )
				.then( ( response: any ) =>
				{
					return response.data;
				} );
		}

		return this.timezonesFetch;
	}
}
