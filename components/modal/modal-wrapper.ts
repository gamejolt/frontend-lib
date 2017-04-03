import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { Modal } from './modal.service';

@Component({})
export class AppModalWrapper extends Vue
{
	@Prop( Modal ) modal: Modal;

	render( h: Vue.CreateElement )
	{
		return h( this.modal.component, {
			props: {
				modal: this.modal,
				...this.modal.props,
			},
			on: {
				resolve: ( response: any ) => this.modal.resolve( response ),
				dismiss: () => this.modal.dismiss(),
			},
		} );
	}
}
