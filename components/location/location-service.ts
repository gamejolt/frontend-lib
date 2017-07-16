import { Injectable, Inject } from 'ng-metadata/core';
import { StateService, StateParams } from 'angular-ui-router';

import { Meta } from '../meta/meta-service';
import { Environment } from '../environment/environment.service';
import { getProvider } from '../../utils/utils';

@Injectable('Location')
export class Location {
	private isApplyPending = false;
	private pendingParams: Object | undefined;

	constructor(
		@Inject('$timeout') private $timeout: ng.ITimeoutService,
		@Inject('$location') private $location: ng.ILocationService,
		@Inject('$state') private $state: StateService
	) {}

	/**
	 * Simply enforces that our current state is the correct URL.
	 * You pass in the params that you want to check for and forces it into the current state with those params.
	 * This is mostly used to ensure slugs are up to date after fetching from server.
	 *
	 * Multiple nested controllers may call it, so we want to take the last params that were given
	 * to us and only set one $apply to run.
	 */
	enforce(params: Object) {
		this.pendingParams = params;

		if (this.isApplyPending) {
			return;
		}

		this.isApplyPending = true;

		this.$timeout(() => {
			const $stateParams: StateParams = getProvider<StateParams>('$stateParams');
			let mergedParams = angular.extend({}, $stateParams, this.pendingParams);

			this.isApplyPending = false;
			this.pendingParams = undefined;

			// Only change the URL if the params we need to enforce aren't set.
			// If they're the same, the URL doesn't need to be changed. It's correct.
			if (angular.equals(mergedParams, $stateParams)) {
				return;
			}

			// Gotta keep the hash.
			// $stateParams doesn't have it, but we need to set it when we call `go()`.
			if (!mergedParams['#'] && this.$location.hash()) {
				mergedParams['#'] = this.$location.hash();
			}

			// This will do a controller refresh, which kind of sucks, but it's more important to keep the URL up to date.
			// NOTE: Setting `notify` to false means that ui-sref links don't get updated with the new URL.
			// This shouldn't be too big of an issue since search engines will eventually correct it.
			// When prerendering we don't redirect in browser, we just send a redirect header.
			if (Environment.isPrerender) {
				Meta.redirect = this.$state.href(this.$state.current, mergedParams);
				Meta.responseCode = '301';
			} else {
				this.$state.go(this.$state.current, mergedParams, {
					location: 'replace',
					notify: false,
				});
			}
		});
	}

	redirectState(state: string, params: Object) {
		// We don't actually redirect if we're prerendering.
		// We instead just return a redirect header.
		if (Environment.isPrerender) {
			Meta.redirect = this.$state.href(state, params);
			Meta.responseCode = '301';
		} else {
			this.$state.go(state, params, { location: 'replace' });
		}
	}
}
