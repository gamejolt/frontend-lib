import { Injectable, Inject } from 'ng-metadata/core';

@Injectable()
export class Youtube_Sdk
{
	isBootstrapped = false;

	constructor(
		@Inject( '$window' ) private $window: ng.IWindowService,
		@Inject( '$timeout' ) private $timeout: ng.ITimeoutService,
		@Inject( '$injector' ) private $injector: any,
		@Inject( '$location' ) private $location: ng.ILocationService,
		@Inject( 'Environment' ) private environment: any
	)
	{
	}

	setupEvents()
	{
		if ( this.$injector.has( 'Analytics' ) ) {
			const Analytics: any = this.$injector.get( 'Analytics' );

			this.$window.onYtEvent = payload =>
			{
				if ( payload.eventType == 'subscribe' ) {
					const url = this.$location.url();
					Analytics.trackSocial( Analytics.SOCIAL_NETWORK_YOUTUBE, Analytics.SOCIAL_ACTION_SUBSCRIBE, url );
				}
				else if ( payload.eventType == 'unsubscribe' ) {
					const url = this.$location.url();
					Analytics.trackSocial( Analytics.SOCIAL_NETWORK_YOUTUBE, Analytics.SOCIAL_ACTION_UNSUBSCRIBE, url );
				}
			};
		}
	}

	load()
	{
		if ( this.environment.isPrerender ) {
			return;
		}

		if ( !this.isBootstrapped ) {
			let bootstrapLib = ( d, s, id ) =>
			{
				let js, fjs = d.getElementsByTagName( s )[0];
				if ( !d.getElementById( id ) ) {
					js = d.createElement( s );
					js.id = id;
					js.onload = () => { this.setupEvents(); };
					js.src = 'https://apis.google.com/js/platform.js';
					fjs.parentNode.insertBefore( js, fjs );
				}
			};
			bootstrapLib( document, 'script', 'youtube-sdk' );
		}
		else {
			this.$timeout( () =>
			{
				if ( typeof this.$window.gapi != 'undefined' ) {
					this.$window.gapi.ytsubscribe.go();
				}
			} );
		}

		this.isBootstrapped = true;
	}
}
