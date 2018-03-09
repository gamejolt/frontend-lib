import Vue from 'vue';
import { Component, Watch } from 'vue-property-decorator';
import View from '!view!./modals.html?style=./modals.styl';

import { Modal } from './modal.service';
import { AppModalWrapper } from './modal-wrapper';

@View
@Component({
	components: {
		AppModalWrapper,
	},
})
export class AppModals extends Vue {
	readonly Modal = Modal;

	get activeModals() {
		return Modal.modals;
	}

	@Watch('activeModals.length')
	watchModalLength() {
		// We only count modals that have backdrops. If all the modals don't
		// have backdrops, then we don't add `modal-open`.
		const backdropModals = Modal.modals.filter(item => !item.noBackdrop);

		if (!GJ_IS_SSR) {
			if (backdropModals.length) {
				document.body.classList.add('modal-open');
			} else {
				document.body.classList.remove('modal-open');
			}
		}
	}
}
