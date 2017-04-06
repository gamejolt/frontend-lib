import Vuex from 'vuex';
import VueRouter from 'vue-router';
import { getProvider } from '../../utils/utils';
import { RequestOptions } from '../api/api.service';
import { Environment } from '../environment/environment.service';
import { Analytics } from '../analytics/analytics.service';
import { AppState } from '../../vue/services/app/app-store';

export class PayloadError
{
	static readonly ERROR_NEW_VERSION = 'payload-new-version';
	static readonly ERROR_NOT_LOGGED = 'payload-not-logged';
	static readonly ERROR_INVALID = 'payload-invalid';
	static readonly ERROR_HTTP_ERROR = 'payload-error';
	static readonly ERROR_OFFLINE = 'payload-offline';

	defaultPrevented = false;

	constructor(
		public type: string,
		public response?: any,
		public status?: number,
	)
	{
	}

	preventDefault()
	{
		this.defaultPrevented = true;
	}
}

export class Payload
{
	static readonly httpErrors = [
		400,
		403,
		404,
		500,
	];

	static store: Vuex.Store<any>;
	static router?: VueRouter;

	private static ver?: number = undefined;
	private static errorHandlers: Function[] = [];

	// TODO: Does angular still work?
	// static initAngular( app: any, $transitions: any )
	// {
	// 	if ( GJ_IS_ANGULAR ) {
	// 		this.App = app;

	// 		// We have to set up a watch on stateChangeErrors.
	// 		// If the error is that we got a new version, then we need to refresh the whole window and follow the new URL.
	// 		// This will force an update of the whole page to pull in the new version's code.
	// 		$transitions.onError( {}, ( trans: any ) =>
	// 		{
	// 			this.handlePayloadError( trans );
	// 		} );
	// 	}
	// }

	static init( store: Vuex.Store<any>, router?: VueRouter )
	{
		this.store = store;
		this.router = router;
	}

	static addErrorHandler( handler: Function )
	{
		this.errorHandlers.push( handler );
	}

	static removeErrorHandler( handler: Function )
	{
		const index = this.errorHandlers.indexOf( handler );
		if ( index !== -1 ) {
			this.errorHandlers.splice( index, 1 );
		}
	}

	static async processResponse( requestPromise: Promise<any>, options: RequestOptions = {} ): Promise<any>
	{
		options = { ...<RequestOptions>{
			ignorePayloadUser: false,
			ignorePayloadVersion: false,
			noErrorRedirect: false,
		}, ...options };

		try {
			let response = await requestPromise;

			if ( !response || !response.data ) {
				if ( !options.noErrorRedirect ) {
					throw new PayloadError(
						PayloadError.ERROR_INVALID,
						response ? (response.data || undefined) : undefined
					);
				}
				else {
					throw response.data || undefined;
				}
			}

			const data = response.data;

			// Don't resolve so that the state doesn't show.
			if ( this.checkRedirect( response ) ) {
				return;
			}

			this.checkPayloadUser( response, options );
			this.checkPayloadVersion( data, options );
			this.checkAnalyticsExperiments( response, options );

			// TODO: Still needed?
			if ( GJ_IS_ANGULAR ) {
				getProvider<any>( '$rootScope' ).$emit( 'Payload.responseSuccess', response );
			}

			return data.payload;
		}
		catch ( error ) {
			console.error( 'Payload error', error );

			if ( error instanceof PayloadError ) {
				throw this.handlePayloadError( error );
			}

			let response: any = undefined;
			if ( error.response ) {
				response = error.response;
			}

			if ( this.checkRedirect( response ) ) {
				return;
			}

			this.checkPayloadUser( response, options );

			// Send an event and let other services react.
			// TODO: Still needed?
			// if ( GJ_IS_ANGULAR ) {
			// 	const $rootScope = getProvider<any>( '$rootScope' );
			// 	const event = $rootScope.$emit( 'Payload.responseError', response, options );

			// 	// If the default was prevented, then we want to allow the response to resolve even though it failed.
			// 	if ( event.defaultPrevented ) {
			// 		return response;
			// 	}
			// }

			if ( !options.noErrorRedirect ) {

				// If the response indicated a failed connection.
				if ( response === undefined || response.status === -1 ) {
					throw this.handlePayloadError( new PayloadError(
						PayloadError.ERROR_OFFLINE,
					) );
				}
				// If it was a 401 error, then they need to be logged in.
				// Let's redirect them to the login page on the main site.
				else if ( response.status === 401 ) {
					throw this.handlePayloadError( new PayloadError(
						PayloadError.ERROR_NOT_LOGGED,
						response.data || undefined,
					) );
				}
				// Otherwise, show an error page.
				else {
					throw this.handlePayloadError( new PayloadError(
						PayloadError.ERROR_HTTP_ERROR,
						response.data || undefined,
						response.status || undefined,
					) );
				}
			}
			else {
				throw error;
			}
		}
	}

	private static checkRedirect( response: any )
	{
		if ( !response || !response.data || !response.data.redirect ) {
			return false;
		}

		// Redirecting within the app.
		// TODO: Get this working for Vue.
		if ( GJ_IS_ANGULAR ) {
			getProvider<any>( '$location' ).url( response.data.redirect );
		}
		else {
			throw new Error( `Response redirect isn't supported for Vue yet.` );
		}

		return true;
	}

	private static checkPayloadVersion( data: any, options: RequestOptions )
	{
		// We ignore completely if we're in the client.
		// We don't want the client refreshing when an update to site is pushed out.
		if ( options.ignorePayloadVersion || GJ_IS_CLIENT ) {
			return;
		}

		if ( data.ver !== this.ver ) {

			// If we didn't have a version, then it's the first payload.
			// Simply assign it.
			if ( this.ver === undefined ) {
				this.ver = data.ver;
			}
			// Otherwise a new version was released.
			// We need to refresh the whole page.
			else {
				// if ( this.router ) {
				// 	console.log( this.router.currentRoute.fullPath );
				// }

				// Reject with the ERROR_NEW_VERSION error.
				// The $stateChangeError event will catch this and reload the page to the new route.
				throw new PayloadError(
					PayloadError.ERROR_NEW_VERSION,
				);
			}
		}
	}

	private static checkPayloadUser( response: any, options: RequestOptions )
	{
		if ( options.ignorePayloadUser || !response || !response.data || !this.store ) {
			return;
		}

		const data = response.data;

		// Only process if this payload response had a user attached to it.
		// It couid be null (for logged out) or an object (if logged in).
		if ( typeof data.user !== 'undefined' ) {

			// If they are logged out, we want to ensure the app user is nulled as well.
			if ( data.user === null ) {
				this.store.commit( AppState.Mutations.clearUser );
			}
			// Otherwise we set up the user with the new data.
			else {

				// We have to require dynamically here, otherwise we end up with
				// a circular reference some times. Something -> User -> Api -> Payload -> User...
				const UserModel = require( '../user/user.model' ).User;
				const user = new UserModel( data.user );
				this.store.commit( AppState.Mutations.setUser, user );
			}
		}

		// TODO: Still needed?
		// // Emit an event to the root scope that a payload has been received and the user has been set.
		// if ( GJ_IS_ANGULAR ) {
		// 	getProvider<any>( '$rootScope' ).$emit( 'Payload.userProcessed', !!this.App.user );
		// }
	}

	private static checkAnalyticsExperiments( response: any, _options: RequestOptions )
	{
		if ( !response.data.payload ) {
			return;
		}

		const payload = response.data.payload;
		if ( payload._experiment && payload._variation && payload._variation !== -1 ) {
			Analytics.setCurrentExperiment( payload._experiment, payload._variation );
		}
	}

	private static handlePayloadError( error: PayloadError )
	{
		// TODO
		// // They may pass in `error` if this API call wasn't done in the middle of a transition.
		// if ( !error ) {
		// 	error = trans.error();
		// }

		// let toState = trans.to();
		// let toParams = trans.params( 'to' );
		// let fromState = trans.from();
		// let fromParams = trans.params( 'from' );

		// const event = {
		// 	defaultPrevented: false,
		// 	preventDefault: () =>
		// 	{
		// 		event.defaultPrevented = true;
		// 	},
		// };

		// // Only process if it's a payload error.
		// if ( !error || !error.type || error.type !== 'payload' ) {
		// 	return;
		// }

		// Handlers can return false to stop processing other handlers set up.
		// They can `.preventDefault()` to not do the default handling below.
		if ( this.errorHandlers.length ) {
			for ( const errorHandler of this.errorHandlers ) {
				if ( errorHandler( error ) === false ) {
					break;
				}
			}
		}

		if ( !error.defaultPrevented ) {

			if ( error.type === PayloadError.ERROR_NEW_VERSION ) {
				// Do nothing. Our BeforeRouteEnter util will catch this payload
				// error and do a refresh of the page after it has the URL to
				// reload.
			}
			else if ( error.type === PayloadError.ERROR_NOT_LOGGED ) {
				let redirect = '';
				if ( this.router ) {
					redirect = encodeURIComponent( this.router.currentRoute.fullPath );
				}
				window.location.href = Environment.authBaseUrl + '/login?redirect=' + redirect;
			}
			else if ( error.type === PayloadError.ERROR_INVALID ) {
				this.store.commit( AppState.Mutations.setError, 500 );
			}
			else if ( error.type === PayloadError.ERROR_HTTP_ERROR && (!error.status || this.httpErrors.indexOf( error.status ) !== -1) ) {
				this.store.commit( AppState.Mutations.setError, (error.status || 500) );
			}
			else {
				this.store.commit( AppState.Mutations.setError, 'offline' );
			}
		}

		return error;
	}
}
