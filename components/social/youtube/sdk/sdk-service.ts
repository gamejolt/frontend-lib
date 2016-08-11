import { Injectable, Inject } from 'ng-metadata/core';

@Injectable()
export class Youtube_Sdk
{
	isBootstrapped = false;

	constructor(
		@Inject( '$window' ) private $window: ng.IWindowService,
		@Inject( '$timeout' ) private $timeout: ng.ITimeoutService,
		@Inject( 'Environment' ) private environment: any
	)
	{
	}

	load()
	{
		if ( this.environment.isPrerender ) {
			return;
		}

		if ( !this.isBootstrapped ) {
			let bootstrapLib = ( d: any, s: any, id: any ) =>
			{
				let js: any, fjs = d.getElementsByTagName( s )[0];
				if ( !d.getElementById( id ) ) {
					js = d.createElement( s );
					js.id = id;
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
