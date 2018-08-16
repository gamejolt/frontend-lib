import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./button.html?style=./button.styl';

import { AppForm } from '../form';
import { findRequiredVueParent } from '../../../utils/vue';

@View
@Component({})
export class AppFormButton extends Vue {
	@Prop(Boolean) showWhenValid!: boolean;
	@Prop(Boolean) block!: boolean;
	@Prop(Boolean) lg!: boolean;

	form!: AppForm;

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
