import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./button.html?style=./button.styl';

import { AppJolticon } from '../../../vue/components/jolticon/jolticon';
import { AppForm } from '../form';
import { findRequiredVueParent } from '../../../utils/vue';

@View
@Component({
	components: {
		AppJolticon,
	},
})
export class AppFormButton extends Vue {
	@Prop({ type: String, default: 'btn-success-outline' })
	type?: string;

	@Prop(String) icon?: string;
	@Prop(Boolean) showWhenValid: boolean;

	form: AppForm;

	get shouldShow() {
		if (!this.showWhenValid) {
			return true;
		}

		return this.form.base.changed && this.form.base.valid;
	}

	created() {
		this.form = findRequiredVueParent(this, require('../form').AppForm);
	}
}
