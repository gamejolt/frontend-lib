import Vue from 'vue';
import { Component, Watch } from 'vue-property-decorator';
import * as View from '!view!./modals.html';
import './modals-global.styl';

import { Modal } from './modal.service';
import { makeObservableService } from '../../utils/vue';
import { AppBackdrop } from '../backdrop/backdrop';
import { AppModalWrapper } from './modal-wrapper';

@View
@Component({
	components: {
		AppModalWrapper,
		AppBackdrop,
	},
})
export class AppModals extends Vue
{
	Modal = makeObservableService( Modal );

	@Watch( 'Modal.modals.length' )
	watchModalLength()
	{
		if ( !GJ_IS_SSR ) {
			if ( Modal.modals.length ) {
				document.body.classList.add( 'modal-open' );
			}
			else {
				document.body.classList.remove( 'modal-open' );
			}
		}
	}
}
