import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import View from '!view!./modal.html?style=./modal.styl';
import './modal-content.styl';

import { Modal } from './modal.service';
import { AppBackdrop } from '../backdrop/backdrop';
import { Backdrop } from '../backdrop/backdrop.service';
import { bootstrapShortkey } from '../../vue/shortkey';
import { findRequiredVueParent } from '../../utils/vue';
import { BaseModal } from './base';

bootstrapShortkey();

@View
@Component({})
export class AppModal extends Vue {
	modal: Modal = null as any;

	private backdrop?: AppBackdrop;
	private beforeEachDeregister?: Function;

	created() {
		const parent = findRequiredVueParent(this, BaseModal);
		this.modal = parent.modal;
	}

	mounted() {
		if (!this.modal.noBackdrop) {
			this.backdrop = Backdrop.push({
				className: 'modal-backdrop',
			});
		}

		this.beforeEachDeregister = this.$router.beforeEach((_to, _from, next) => {
			this.dismissRouteChange();
			next();
		});
	}

	destroyed() {
		// Make sure we clear the reference to it.
		if (this.backdrop) {
			this.backdrop.remove();
			this.backdrop = undefined;
		}

		if (this.beforeEachDeregister) {
			this.beforeEachDeregister();
			this.beforeEachDeregister = undefined;
		}
	}

	dismissRouteChange() {
		this.dismiss();
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
