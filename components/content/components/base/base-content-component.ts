import View from '!view!./base-content-component.html?style=./base-content-component.styl';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@View
@Component({})
export class AppBaseContentComponent extends Vue {
	@Prop(Boolean)
	isEditing!: Boolean;

	onRemovedClicked() {
		this.$emit('removed');
	}
}
