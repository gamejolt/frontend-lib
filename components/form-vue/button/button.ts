import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { findRequiredVueParent } from '../../../utils/vue';
import AppForm from '../form';

@Component({})
export default class AppFormButton extends Vue {
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
		// TODO: should be require('../form.vue') ?
		this.form = findRequiredVueParent(this, require('../form'));
	}
}
