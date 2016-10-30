import { Directive, Inject } from 'ng-metadata/core';
import { AuthModal } from './auth-modal.service';

@Directive( {
	selector: 'gj-auth-required',
})
export class AuthRequiredDirective
{
	constructor(
		@Inject( '$element' ) private $element: ng.IAugmentedJQuery,
		@Inject( 'AuthModal' ) private modal: AuthModal,

		// We can't inject through type yet since App may be different
		// depending on where this is included.
		@Inject( 'App' ) private app: any,
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
		} );
	}
}
