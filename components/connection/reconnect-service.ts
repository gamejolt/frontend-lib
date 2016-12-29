import { Injectable } from '@angular/core';

const TIMEOUT_INITIAL = 2000;
const TIMEOUT_GROW = 1.5;
const TIMEOUT_MAX = 30000;

export function ConnectionReconnectFactory( $timeout: any, $http: any, Environment: any )
{
	ConnectionReconnect.$timeout = $timeout;
	ConnectionReconnect.$http = $http;
	ConnectionReconnect.env = Environment;
	return ConnectionReconnect;
}

@Injectable()
export class ConnectionReconnect
{
	static $timeout: ng.ITimeoutService;
	static $http: ng.IHttpService;
	static env: any;

	private _checkUrl: string;

	private _failFn: Function;
	private _successFn: Function;

	private _timeoutMs = TIMEOUT_INITIAL;
	private _timeoutPromise?: ng.IPromise<void>;

	constructor( failFn: Function, successFn: Function )
	{
		// We just hit the favicon from the CDN.
		// Should be pretty lightweight.
		this._checkUrl = 'https://b6d3e9q9.ssl.hwcdn.net/app/img/favicon.png';

		if ( ConnectionReconnect.env.env == 'development' ) {
			this._checkUrl = 'http://development.gamejolt.com/app/img/favicon.png';
		}

		this._failFn = failFn;
		this._successFn = successFn;
		this._timeoutMs = TIMEOUT_INITIAL;

		this.check();
	}

	private _setTimeout()
	{
		this._timeoutPromise = ConnectionReconnect.$timeout( () =>
		{
			// Before checking reset the timeout details.
			this._timeoutMs = Math.min( TIMEOUT_MAX, this._timeoutMs * TIMEOUT_GROW );
			this._timeoutPromise = undefined;

			// Now check to see if we're back online.
			this.check();
		}, this._timeoutMs );
	}

	check()
	{
		// Make sure we don't cache the call.
		ConnectionReconnect.$http.head( this._checkUrl + '?cb=' + Date.now() )
			.then( () =>
			{
				console.log( 'success' );
				this.finish();
			} )
			.catch( ( response: any ) =>
			{
				console.log( 'fail', response );
				// Just as long as the response doesn't have a status code of -1.
				// After all, a 404 still means that we are connected to the internet.
				if ( response.status !== -1 ) {
					this.finish();
				}
				else {
					// Still failing, so keep going.
					this._failFn();
					this._setTimeout();
				}
			} );
	}

	finish()
	{
		// If this was called when we're currently waiting on a timeout we need to clean it up.
		if ( this._timeoutPromise ) {
			ConnectionReconnect.$timeout.cancel( this._timeoutPromise );
		}

		this._successFn();
	}
}
