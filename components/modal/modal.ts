import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./modal.html?style=./modal.styl';
import './modal-content.styl';

import { Modal } from './modal.service';
import { AppBackdrop } from '../backdrop/backdrop';
import { Backdrop } from '../backdrop/backdrop.service';
import { bootstrapShortkey } from '../../vue/shortkey';

bootstrapShortkey();

@View
@Component({})
export class AppModal extends Vue
{
	@Prop( Modal ) modal: Modal;

	private backdrop?: AppBackdrop;

	mounted()
	{
		this.backdrop = Backdrop.push();
	}

	destroyed()
	{
		// Make sure we clear the reference to it.
		if ( this.backdrop ) {
			this.backdrop.remove();
			this.backdrop = undefined;
		}
	}

	dismiss()
	{
		this.modal.dismiss();
	}
}
