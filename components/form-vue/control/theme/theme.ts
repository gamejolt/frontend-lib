import { Component } from 'vue-property-decorator';
import View from '!view!./theme.html?style=./theme.styl';

import { BaseFormControl } from '../base';
import { AppThemeBubble } from '../../../theme/bubble/bubble';
import { AppTooltip } from '../../../tooltip/tooltip';
import { Api } from '../../../api/api.service';
import { ThemePreset, DefaultThemePreset } from '../../../theme/preset/preset.model';
import { AppPopover } from '../../../popover/popover';
import { AppPopoverTrigger } from '../../../popover/popover-trigger.directive.vue';
import { makeThemeFromPreset, Theme, makeThemeFromColor } from '../../../theme/theme.model';
import { Sketch } from 'vue-color';
import { AppLoading } from '../../../../vue/components/loading/loading';

interface VueColor {
	hex: string | null;
}

@View
@Component({
	components: {
		AppLoading,
		AppThemeBubble,
		AppPopover,
		picker: Sketch,
	},
	directives: {
		AppPopoverTrigger,
		AppTooltip,
	},
})
export class AppFormControlTheme extends BaseFormControl {
	controlVal: Theme | null = null;
	presets: ThemePreset[] = [];
	activeTab: 'preset' | 'custom' = 'preset';
	customSelection: VueColor = { hex: null };

	get currentTheme() {
		return this.controlVal || new Theme();
	}

	async onPopover() {
		this.activeTab = this.currentTheme.custom ? 'custom' : 'preset';
		this.customSelection.hex = this.currentTheme.custom || null;

		if (this.presets.length) {
			return;
		}

		const response = await Api.sendRequest('/web/theme-presets');
		this.presets = ThemePreset.populate(response.presets);
		this.presets.unshift(DefaultThemePreset);
	}

	selectPreset(preset: ThemePreset) {
		this.applyValue(makeThemeFromPreset(preset));
	}

	isPresetActive(preset: ThemePreset) {
		if (this.currentTheme.custom) {
			return false;
		}

		if (this.controlVal === null && preset.id === 0) {
			return true;
		}

		return this.currentTheme.theme_preset_id === preset.id;
	}

	onCustomChange(colors: VueColor) {
		this.applyValue(makeThemeFromColor((colors.hex || '').substr(1)));
	}
}
