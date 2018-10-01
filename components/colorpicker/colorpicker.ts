import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import View from '!view!./colorpicker.html?style=./colorpicker.styl';

import { Sketch } from 'vue-color';
import { AppJolticon } from '../../vue/components/jolticon/jolticon';
import { Popover } from '../popover/popover.service';
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
	@Prop(String) value!: string;

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
		Popover.hideAll();
	}

	cancel() {
		this.colors = {
			hex: this.value,
		};
		Popover.hideAll();
	}
}
