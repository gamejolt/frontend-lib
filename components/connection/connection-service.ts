import { ConnectionReconnect } from './reconnect-service';

export class Connection
{
	static isDeviceOffline: boolean;
	static isClientOffline: boolean;
	static isOnline: boolean;

	private static hasRequestFailure = false;
	private static _reconnectChecker?: ConnectionReconnect;

	static initAngular( $rootScope: any )
	{
		// This attribute isn't perfect.
		// The browser will set this when they are absolutely disconnected to the internet through their
		// network card, but it won't catch things like their router saying they're connected even though
		// it has no connection.
		// We have to do our own request checking for that.
		this.isDeviceOffline = !window.navigator.onLine;
		this.isOnline = !this.isDeviceOffline && !this.hasRequestFailure;

		// Convenience var to make it easier to hide things offline just in client.
		this.isClientOffline = GJ_IS_CLIENT && !this.isOnline;

		$rootScope.$on( 'Payload.responseError', ( _event: any, response: any ) =>
		{
			// Usually offline, timed out, or aborted request.
			// Set that a request has failed.
			if ( response.status === -1 ) {
				this._setRequestFailure( true );
			}
		} );

		// Clear out our request errors when a successful response comes through.
		$rootScope.$on( 'Payload.responseSuccess', () => this._setRequestFailure( false ) );

		// We hook into browser events to know right away if they lost connection to their router.
		document.addEventListener( 'online', () =>
		{
			this.isDeviceOffline = false;
			this._refreshIsOnline();

			// While connection was offline, we may have tried making a request that failed.
			// Let's recheck for connectivity right away if that is the case.
			if ( this._reconnectChecker ) {
				this._reconnectChecker.check();
			}
		} );

		document.addEventListener( 'offline', () =>
		{
			this.isDeviceOffline = true;
			this._refreshIsOnline();
		} );
	}

	private static _setupReconnectChecker()
	{
		// We don't want to set that we have a request failure until we do a first check that fails.
		// When we come back online, we just want to set that we no longer have a request failure.
		this._reconnectChecker = new ConnectionReconnect(
			() =>
			{
				// If we were marked as no request failure, let's put us in that mode.
				if ( !this.hasRequestFailure ) {
					this.hasRequestFailure = true;
					this._refreshIsOnline();
				}
			},
			() =>
			{
				// We are connected back to the server.
				// Let's set that we're good to go.
				this._reconnectChecker = undefined;

				// Only toggle back to no failure if we were set as having a failure.
				// This ensures we don't reload the page if we don't have to.
				if ( this.hasRequestFailure ) {
					this.hasRequestFailure = false;
					this._refreshIsOnline();
				}
			}
		);
	}

	/**
	 * Can be used to tell us that a request has failed due to a connection error
	 * or when a request has went through successfully so we can reset.
	 */
	private static _setRequestFailure( failed: boolean )
	{
		// Do nothing if we're not switch states.
		if ( this.hasRequestFailure === failed ) {
			return;
		}

		// If we went into request failure mode let's start checking for a reconnection.
		if ( failed ) {
			this._setupReconnectChecker();
		}

		// If we got a successful request, go back into a good request state right away.
		if ( !failed && this._reconnectChecker ) {
			this._reconnectChecker.finish();
		}
	};

	/**
	 * Does all the required checks to see if the connection is down.
	 * This way we can access it through one simple variable, even though we store
	 * different statuses for different types of connection errors.
	 */
	private static _refreshIsOnline()
	{
		if ( this.hasRequestFailure || this.isDeviceOffline ) {
			this.isOnline = false;
		}
		else {
			this.isOnline = true;
		}

		this.isClientOffline = GJ_IS_CLIENT && !this.isOnline;
	}
}
