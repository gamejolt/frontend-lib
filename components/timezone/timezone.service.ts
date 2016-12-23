import { Injectable, Inject } from 'ng-metadata/core';

@Injectable()
export class Timezone
{
	private timezonesFetch: any;

	constructor(
		@Inject( 'Api' ) private apiService: any,
	)
	{
	}

	getTimezones()
	{
		if ( !this.timezonesFetch ) {

			// Raw request (ignore most payload stuff).
			const options = {
				withCredentials: false,
				detach: true,
				processPayload: false,
			};

			this.timezonesFetch = this.apiService.sendRequest( '/jams/manage/jams/get-timezones', null, options )
				.then( ( response: any ) =>
				{
					return response.data;
				} );
		}

		return this.timezonesFetch;
	}
}
