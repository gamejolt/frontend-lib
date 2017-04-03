import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./confirm.html';

import { AppModal } from '../modal';
import { Modal } from '../modal.service';
import { AppJolticon } from '../../../vue/components/jolticon/jolticon';

@View
@Component({
	components: {
		AppModal,
		AppJolticon,
	},
})
export class AppModalConfirm extends Vue
{
	@Prop( Modal ) modal: Modal;
	@Prop( String ) message: string;
	@Prop( String ) title: string;
	@Prop( String ) buttonType: 'ok' | 'yes';

	ok()
	{
		this.$emit( 'resolve' );
	}

	cancel()
	{
		this.$emit( 'dismiss' );
	}
}
