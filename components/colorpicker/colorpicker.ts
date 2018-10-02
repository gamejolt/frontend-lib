import View from '!view!./colorpicker.html?style=./colorpicker.styl';
import { Popper } from 'game-jolt-frontend-lib/components/popper/popper.service';
import Vue from 'vue';
import { Sketch } from 'vue-color';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { AppJolticon } from '../../vue/components/jolticon/jolticon';
import { AppPopper } from '../popper/popper';

@View
@Component({
	components: {
		picker: Sketch,
		AppPopper,
		AppJolticon,
	},
})
export class AppColorpicker extends Vue {
	@Prop(String)
	value!: string;

	colors: any = {};

	@Watch('value', { immediate: true })
	onValueChanged() {
		this.colors = {
			hex: this.value,
		};
	}

	onChange(value: any) {
		this.colors = value;
	}

	accept() {
		this.$emit('input', this.colors.hex);
		Popper.hideAll();
	}

	cancel() {
		this.colors = {
			hex: this.value,
		};
		Popper.hideAll();
	}
}
