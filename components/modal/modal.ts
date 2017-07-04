import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./modal.html?style=./modal.styl';
import './modal-content.styl';

import { Modal } from './modal.service';
import { AppBackdrop } from '../backdrop/backdrop';
import { Backdrop } from '../backdrop/backdrop.service';
import { bootstrapShortkey } from '../../vue/shortkey';
import { findVueParent } from '../../utils/vue';
import { BaseModal } from './base';

bootstrapShortkey();

@View
@Component({})
export class AppModal extends Vue {
	modal: Modal = null as any;
	private backdrop?: AppBackdrop;

	created() {
		const parent = findVueParent(this, BaseModal) as BaseModal;
		if (!parent) {
			throw new Error(`Couldn't find base modal.`);
		}

		this.modal = parent.modal;
	}

	mounted() {
		if (!this.modal.noBackdrop) {
			this.backdrop = Backdrop.push();
		}
	}

	destroyed() {
		// Make sure we clear the reference to it.
		if (this.backdrop) {
			this.backdrop.remove();
			this.backdrop = undefined;
		}
	}

	dismissEsc() {
		if (this.modal.noEscClose) {
			return;
		}
		this.dismiss();
	}

	dismissBackdrop() {
		if (this.modal.noBackdropClose) {
			return;
		}
		this.dismiss();
	}

	dismiss() {
		this.modal.dismiss();
	}
}