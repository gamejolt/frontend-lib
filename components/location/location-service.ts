import { Injectable, Inject } from 'ng-metadata/core';
import { Meta } from './../meta/meta-service';

@Injectable()
export class Location
{
	private isApplyPending = false;
	private pendingParams: Object | undefined;

	constructor(
		@Inject( '$timeout' ) private $timeout: ng.ITimeoutService,
		@Inject( '$location' ) private $location: ng.ILocationService,
		@Inject( '$state' ) private $state: ng.ui.IStateService,
		@Inject( '$injector' ) private $injector: any,
		@Inject( 'Meta' ) private Meta: Meta,
		@Inject( 'Environment' ) private Environment: any,
	)
	{
	}

	/**
	 * Simply enforces that our current state is the correct URL.
	 * You pass in the params that you want to check for and forces it into the current state with those params.
	 * This is mostly used to ensure slugs are up to date after fetching from server.
	 *
	 * Multiple nested controllers may call it, so we want to take the last params that were given
	 * to us and only set one $apply to run.
	 */
	enforce( params: Object )
	{
		this.pendingParams = params;

		if ( this.isApplyPending ) {
			return;
		}

		this.isApplyPending = true;

		this.$timeout( () =>
		{
			const $stateParams: ng.ui.IStateParamsService = this.$injector.get( '$stateParams' );
			let mergedParams = angular.extend( {}, $stateParams, this.pendingParams );

			// Only change the URL if the params we need to enforce aren't set.
			// If they're the same, the URL doesn't need to be changed. It's correct.
			if ( angular.equals( mergedParams, $stateParams ) ) {
				return;
			}

			// Gotta keep the hash.
			// $stateParams doesn't have it, but we need to set it when we call `go()`.
			if ( !mergedParams['#'] && this.$location.hash() ) {
				mergedParams['#'] = this.$location.hash();
			}

			// This will do a controller refresh, which kind of sucks, but it's more important to keep the URL up to date.
			// NOTE: Setting `notify` to false doesn't work. ui-sref links don't get updated with the new URL.
			// When prerendering we don't redirect in browser, we just send a redirect header.
			if ( this.Environment.isPrerender ) {
				this.Meta.redirect = this.$state.href( this.$state.current, mergedParams );
				this.Meta.responseCode = '301';
			}
			else {
				this.$state.go( this.$state.current, mergedParams, { location: 'replace' } );
			}

			this.isApplyPending = false;
			this.pendingParams = undefined;
		} );
	}

	redirectState( state: string, params: Object )
	{
		// We don't actually redirect if we're prerendering.
		// We instead just return a redirect header.
		if ( this.Environment.isPrerender ) {
			this.Meta.redirect = this.$state.href( state, params );
			this.Meta.responseCode = '301';
		}
		else {
			this.$state.go( state, params, { location: 'replace' } );
		}
	}
}
