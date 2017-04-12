import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./toggle-switch.html?style=./toggle-switch.styl';

import { BaseFormControl } from '../base';

@View
@Component({})
export class AppFormControlToggleSwitch extends BaseFormControl
{
	@Prop( String ) onLabel?: string;
	@Prop( String ) offLabel?: string;
	@Prop( Boolean ) disabled?: boolean;

	value: boolean = false;

	get _onLabel()
	{
		return this.onLabel || this.$gettext( 'On' );
	}

	get _offLabel()
	{
		return this.offLabel || this.$gettext( 'Off' );
	}

	toggle()
	{
		if ( this.disabled ) {
			return;
		}

		this.applyValue( !this.value );
	}
}
