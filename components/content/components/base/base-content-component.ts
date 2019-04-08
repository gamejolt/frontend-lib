import View from '!view!./base-content-component.html?style=./base-content-component.styl';
import { AppTooltip } from 'game-jolt-frontend-lib/components/tooltip/tooltip';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@View
@Component({
	directives: {
		AppTooltip,
	},
})
export class AppBaseContentComponent extends Vue {
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
