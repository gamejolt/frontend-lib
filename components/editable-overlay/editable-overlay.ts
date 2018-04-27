import Vue from 'vue';
import { Component, Prop, Emit } from 'vue-property-decorator';
import View from '!view!./editable-overlay.html?style=./editable-overlay.styl';

@View
@Component({})
export class AppEditableOverlay extends Vue {
	@Prop(Boolean) disabled?: boolean;

	@Emit()
	click() {}
}
