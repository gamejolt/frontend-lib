import Vue, { CreateElement } from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { findRequiredVueParent } from '../../../utils/vue';
import AppFormControlErrorsTS from './control-errors';
import AppFormControlErrors from './control-errors.vue';

@Component({})
export class AppFormControlError extends Vue {
	@Prop(String) when!: string;
	@Prop(String) message!: string;

	mounted() {
		this.setOverride();
	}

	@Watch('message')
	onMessageChange() {
		this.setOverride();
	}

	private setOverride() {
		const errors = findRequiredVueParent(this, AppFormControlErrors) as AppFormControlErrorsTS;
		errors.setMessageOverride(this.when, this.message);
	}

	render(h: CreateElement) {
		return h('span');
	}
}
