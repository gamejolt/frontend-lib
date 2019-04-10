import { AppTooltip } from 'game-jolt-frontend-lib/components/tooltip/tooltip';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@Component({
	directives: {
		AppTooltip,
	},
})
export default class AppBaseContentComponent extends Vue {
	@Prop(Boolean)
	isEditing!: boolean;

	@Prop(Boolean)
	showEdit!: boolean;

	@Prop(Boolean)
	isDisabled!: boolean;

	onRemovedClicked() {
		if (!this.isDisabled) {
			this.$emit('removed');
		}
	}

	onEditClicked() {
		if (!this.isDisabled) {
			this.$emit('edit');
		}
	}
}
