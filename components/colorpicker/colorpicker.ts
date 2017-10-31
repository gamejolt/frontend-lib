import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import View from '!view!./colorpicker.html?style=./colorpicker.styl';

import { Sketch } from 'vue-color';
import { AppPopover } from '../popover/popover';
import { AppPopoverTrigger } from '../popover/popover-trigger.directive.vue';
import { AppJolticon } from '../../vue/components/jolticon/jolticon';
import { Popover } from '../popover/popover.service';

@View
@Component({
	components: {
		picker: Sketch,
		AppPopover,
		AppJolticon,
	},
	directives: {
		AppPopoverTrigger,
	},
})
export class AppColorpicker extends Vue {
	@Prop(String) value: string;

	id = '';
	isOpen = false;
	colors: any = {};

	@Watch('value', { immediate: true })
	onValueChanged() {
		this.colors = {
			hex: this.value,
		};
	}

	created() {
		this.id = Math.random() + '';
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
