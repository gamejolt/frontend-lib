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
	isEditing!: Boolean;

	@Prop(Boolean)
	showEdit!: Boolean;

	onRemovedClicked() {
		this.$emit('removed');
	}

	onEditClicked() {
		this.$emit('edit');
	}
}
