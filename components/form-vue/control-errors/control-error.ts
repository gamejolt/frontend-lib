import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { findVueParent } from '../../../utils/vue';
import { AppFormControlErrors } from './control-errors';

@Component({
	name: 'form-control-error',
})
export class AppFormControlError extends Vue
{
	@Prop( String ) when: string;

	mounted()
	{
		const defaultSlot = this.$slots.default[0];
		const errors = findVueParent( this, AppFormControlErrors ) as AppFormControlErrors;

		if ( defaultSlot.text ) {
			errors.setMessageOverride( this.when, defaultSlot.text );
		}
	}

	render( h: Vue.CreateElement )
	{
		return h( 'span' );
	}
}
