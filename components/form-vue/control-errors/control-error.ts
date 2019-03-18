import Vue, { CreateElement } from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { findRequiredVueParent } from '../../../utils/vue';
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
		// TODO: should be require('./control-errors.vue') ?
		const errors = findRequiredVueParent(this, require('./control-errors')
			.AppFormControlErrors as typeof AppFormControlErrors);
		errors.setMessageOverride(this.when, this.message);
	}

	render(h: CreateElement) {
		return h('span');
	}
}
