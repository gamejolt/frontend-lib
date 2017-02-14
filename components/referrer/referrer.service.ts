import { getProvider } from '../../utils/utils';
/**
 * Since we're in a single page app, the referrer doesn't get reset on every page change.
 * To be able to pull the correct referrer we need to spoof it by updating on every state change.
 * The initial referrer from the Document should be correct when we first hit the page.
 * If it's "null" then there was no referrer when hitting the initial page.
 */
export class Referrer
{
	private static isInitialized = false;

	/**
	 * We will set this to false after the first page change.
	 * We don't artifically track new referrers until after the first page has passed.
	 */
	private static firstPass = true;

	/**
	 * After every location change we store the current URL.
	 * We can use this value as the referrer when switching to the next page.
	 */
	private static currentUrl?: string;

	private static prev?: string;
	private static referrer?: string;

	static init()
	{
		this.isInitialized = true;

		if ( window.document.referrer ) {
			this.referrer = window.document.referrer;
		}

		if ( GJ_IS_ANGULAR ) {
			const $rootScope = getProvider<any>( '$rootScope' );

			$rootScope.$on( '$stateChangeStart', () =>
			{
				// Don't track until we've tracked on full page view.
				if ( this.firstPass ) {
					return;
				}

				// Store the current one so we can rollback if the state change fails.
				this.prev = this.referrer;
				this.referrer = this.currentUrl;
			} );

			$rootScope.$on( '$stateChangeSuccess', () =>
			{
				// We have finished the first state change.
				// We will now begin tracking new referrers.
				this.firstPass = false;
				this.currentUrl = window.location.href;
			} );

			$rootScope.$on( '$stateChangeError', () =>
			{
				// Rollback.
				this.referrer = this.prev;
			} );
		}
	}

	static get()
	{
		if ( !this.isInitialized ) {
			throw new Error( `Using Referrer before it's initialized.` );
		}

		return this.referrer;
	}
}
