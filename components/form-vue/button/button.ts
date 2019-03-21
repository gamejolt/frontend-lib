import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { findRequiredVueParent } from '../../../utils/vue';
import AppFormTS from '../form';

@Component({})
export default class AppFormButton extends Vue {
	@Prop(Boolean) showWhenValid!: boolean;
	@Prop(Boolean) block!: boolean;
	@Prop(Boolean) lg!: boolean;

	form!: AppFormTS;

	get shouldShow() {
		if (!this.showWhenValid) {
			return true;
		}

		return this.form.base.changed && this.form.base.valid;
	}

	created() {
		this.form = findRequiredVueParent(this, require('../form.vue').default) as AppFormTS;
	}
}
