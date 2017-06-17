import { getProvider } from '../../utils/utils';

const TIMEOUT_INITIAL = 2000;
const TIMEOUT_GROW = 1.5;
const TIMEOUT_MAX = 30000;

export class ConnectionReconnect {
	private _checkUrl: string;

	private _failFn: Function;
	private _successFn: Function;

	private _timeoutMs = TIMEOUT_INITIAL;
	private _timeoutPromise?: ng.IPromise<void>;

	constructor(failFn: Function, successFn: Function) {
		// We just hit the favicon from the CDN.
		// Should be pretty lightweight.
		this._checkUrl = require('./check.png');

		this._failFn = failFn;
		this._successFn = successFn;
		this._timeoutMs = TIMEOUT_INITIAL;

		this.check();
	}

	private _setTimeout() {
		const $timeout = getProvider<ng.ITimeoutService>('$timeout');

		this._timeoutPromise = $timeout(() => {
			// Before checking reset the timeout details.
			this._timeoutMs = Math.min(TIMEOUT_MAX, this._timeoutMs * TIMEOUT_GROW);
			this._timeoutPromise = undefined;

			// Now check to see if we're back online.
			this.check();
		}, this._timeoutMs);
	}

	check() {
		const $http = getProvider<ng.IHttpService>('$http');

		// Make sure we don't cache the call.
		$http
			.head(this._checkUrl + '?cb=' + Date.now())
			.then(() => {
				this.finish();
			})
			.catch((response: any) => {
				// Just as long as the response doesn't have a status code of -1.
				// After all, a 404 still means that we are connected to the internet.
				if (response.status !== -1) {
					this.finish();
				} else {
					// Still failing, so keep going.
					this._failFn();
					this._setTimeout();
				}
			});
	}

	finish() {
		const $timeout = getProvider<ng.ITimeoutService>('$timeout');

		// If this was called when we're currently waiting on a timeout we need to clean it up.
		if (this._timeoutPromise) {
			$timeout.cancel(this._timeoutPromise);
		}

		this._successFn();
	}
}
