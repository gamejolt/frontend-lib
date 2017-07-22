import { RequestOptions } from '../api/api.service';
import { Environment } from '../environment/environment.service';
import { Analytics } from '../analytics/analytics.service';
import { User } from '../user/user.model';
import { VuexStore } from '../../utils/vuex';
import { LocationRedirect } from '../../utils/router';

export class PayloadError {
	static readonly ERROR_NEW_VERSION = 'payload-new-version';
	static readonly ERROR_NOT_LOGGED = 'payload-not-logged';
	static readonly ERROR_INVALID = 'payload-invalid';
	static readonly ERROR_HTTP_ERROR = 'payload-error';
	static readonly ERROR_OFFLINE = 'payload-offline';
	static readonly ERROR_REDIRECT = 'payload-redirect';

	redirect?: string;

	constructor(public type: string, public response?: any, public status?: number) {}
}

export class Payload {
	static readonly httpErrors = [400, 403, 404, 500];

	private static store: VuexStore;
	private static ver?: number = undefined;

	static init(store: VuexStore) {
		this.store = store;
	}

	static async processResponse(
		requestPromise: Promise<any>,
		options: RequestOptions = {}
	): Promise<any> {
		options = {
			...<RequestOptions>{
				ignorePayloadUser: false,
				ignorePayloadVersion: false,
				noErrorRedirect: false,
			},
			...options,
		};

		try {
			let response = await requestPromise;

			if (!response || !response.data) {
				if (!options.noErrorRedirect) {
					throw new PayloadError(
						PayloadError.ERROR_INVALID,
						response ? response.data || undefined : undefined
					);
				} else {
					throw response.data || undefined;
				}
			}

			const data = response.data;

			this.checkRedirect(response);
			this.checkPayloadUser(response, options);
			this.checkPayloadVersion(data, options);
			this.checkAnalyticsExperiments(response, options);

			return data.payload;
		} catch (error) {
			console.error('Payload error', error);

			if (error instanceof PayloadError) {
				throw this.handlePayloadError(error);
			}

			// Simply rethrow if it's a redirect.
			if (error instanceof LocationRedirect) {
				throw error;
			}

			let response: any = undefined;
			if (error.response) {
				response = error.response;
			}

			this.checkRedirect(response);
			this.checkPayloadUser(response, options);

			if (!options.noErrorRedirect) {
				// If the response indicated a failed connection.
				if (response === undefined || response.status === -1) {
					throw this.handlePayloadError(new PayloadError(PayloadError.ERROR_OFFLINE));
				} else if (response.status === 401) {
					// If it was a 401 error, then they need to be logged in.
					// Let's redirect them to the login page on the main site.
					throw this.handlePayloadError(
						new PayloadError(PayloadError.ERROR_NOT_LOGGED, response.data || undefined)
					);
				} else {
					// Otherwise, show an error page.
					throw this.handlePayloadError(
						new PayloadError(
							PayloadError.ERROR_HTTP_ERROR,
							response.data || undefined,
							response.status || undefined
						)
					);
				}
			} else {
				throw error;
			}
		}
	}

	private static checkRedirect(response: any) {
		if (!response || !response.data || !response.data.redirect) {
			return;
		}

		// The routeResolve func will handle this redirect error.
		throw new LocationRedirect(response.data.redirect);
	}

	private static checkPayloadVersion(data: any, options: RequestOptions) {
		// We ignore completely if we're in the client.
		// We don't want the client refreshing when an update to site is pushed out.
		if (options.ignorePayloadVersion || GJ_IS_CLIENT) {
			return;
		}

		if (data.ver !== this.ver) {
			// If we didn't have a version, then it's the first payload.
			// Simply assign it.
			if (this.ver === undefined) {
				this.ver = data.ver;
			} else {
				throw new PayloadError(PayloadError.ERROR_NEW_VERSION);
			}
		}
	}

	private static checkPayloadUser(response: any, options: RequestOptions) {
		if (options.ignorePayloadUser || !response || !response.data || !this.store) {
			return;
		}

		// Only process if this payload response had a user attached to it.
		// It couid be null (for logged out) or an object (if logged in).
		const data = response.data;
		if (typeof data.user !== 'undefined') {
			if (data.user === null) {
				this.store.commit('app/clearUser');
			} else {
				this.store.commit('app/setUser', new User(data.user));
			}
		}
	}

	private static checkAnalyticsExperiments(response: any, _options: RequestOptions) {
		if (!response.data.payload) {
			return;
		}

		const payload = response.data.payload;
		if (payload._experiment && payload._variation && payload._variation !== -1) {
			Analytics.setCurrentExperiment(payload._experiment, payload._variation);
		}
	}

	private static handlePayloadError(error: PayloadError) {
		if (error.type === PayloadError.ERROR_NEW_VERSION) {
			// Do nothing. Our BeforeRouteEnter util will catch this payload
			// error and do a refresh of the page after it has the URL to
			// reload.
		} else if (error.type === PayloadError.ERROR_NOT_LOGGED) {
			const redirect = encodeURIComponent(window.location.href);
			window.location.href = Environment.authBaseUrl + '/login?redirect=' + redirect;
		} else if (error.type === PayloadError.ERROR_INVALID) {
			this.store.commit('app/setError', 500);
		} else if (
			error.type === PayloadError.ERROR_HTTP_ERROR &&
			(!error.status || this.httpErrors.indexOf(error.status) !== -1)
		) {
			this.store.commit('app/setError', error.status || 500);
		} else {
			this.store.commit('app/setError', 'offline');
		}

		return error;
	}
}
