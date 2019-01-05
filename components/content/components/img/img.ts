import View from '!view!./img.html?style=./img.styl';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { AppBaseContentComponent } from '../base/base-content-component';

@View
@Component({
	components: {
		AppBaseContentComponent,
	},
})
export class AppContentImg extends Vue {
	@Prop(String)
	src!: string;

	@Prop(Boolean)
	isEditing!: boolean;

	onRemoved() {
		this.$emit('removed');
	}
}
