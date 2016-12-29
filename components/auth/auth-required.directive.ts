import { Directive, Inject } from '@angular/core';
import { AuthModal } from './auth-modal.service';
import { App } from '../app/app.service';

@Directive( {
	selector: 'gj-auth-required',
})
export class AuthRequiredDirective
{
	constructor(
		@Inject( '$element' ) private $element: ng.IAugmentedJQuery,
		@Inject( 'Analytics' ) private analytics: any,
		private modal: AuthModal,
		private app: App,
	)
	{
		// Can't use HostListener with ng-metadata because it was binding
		// too late.
		this.$element.on( 'click', ( event ) =>
		{
			if ( this.app.user ) {
				return;
			}

			event.stopPropagation();
			event.preventDefault();

			this.modal.show();
			this.analytics.trackEvent( 'auth-required-modal', 'shown' );
		} );
	}
}
