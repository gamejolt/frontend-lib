import View from '!view!./theme.html?style=./theme.styl';
import { Sketch } from 'vue-color';
import { Component, Prop } from 'vue-property-decorator';
import { AppLoading } from '../../../../vue/components/loading/loading';
import { Api } from '../../../api/api.service';
import { AppButton } from '../../../button/button';
import { AppPopper } from '../../../popper/popper';
import { AppThemeBubble } from '../../../theme/bubble/bubble';
import { ThemePreset } from '../../../theme/preset/preset.model';
import { makeThemeFromColor, makeThemeFromPreset, Theme } from '../../../theme/theme.model';
import { AppTooltip } from '../../../tooltip/tooltip';
import { BaseFormControl } from '../base';

interface VueColor {
	hex: string | null;
}

@View
@Component({
	components: {
		AppLoading,
		AppThemeBubble,
		AppPopper,
		AppButton,
		picker: Sketch,
	},
	directives: {
		AppTooltip,
	},
})
export class AppFormControlTheme extends BaseFormControl {
	@Prop(Boolean)
	disabled!: boolean;

	controlVal: Theme | null = null;
	presets: ThemePreset[] = [];
	activeTab: 'preset' | 'custom' = 'preset';
	customSelection: VueColor = { hex: null };

	get currentTheme() {
		return this.controlVal || new Theme();
	}

	get highlight() {
		return this.controlVal && (this.controlVal.custom || this.controlVal.highlight);
	}

	get backlight() {
		if (this.controlVal) {
			// Don't show backlight when a custom color is chosen.
			return this.controlVal.custom ? null : this.controlVal.backlight;
		}
		return null;
	}

	async onPopover() {
		this.activeTab = this.currentTheme.custom ? 'custom' : 'preset';
		this.customSelection.hex = this.currentTheme.custom || null;

		if (this.presets.length) {
			return;
		}

		const response = await Api.sendRequest('/web/theme-presets');
		this.presets = ThemePreset.populate(response.presets);
	}

	selectPreset(preset: ThemePreset) {
		this.applyValue(makeThemeFromPreset(preset));
	}

	isPresetActive(preset: ThemePreset) {
		if (this.currentTheme.custom) {
			return false;
		}

		return this.currentTheme.theme_preset_id === preset.id;
	}

	onCustomChange(colors: VueColor) {
		this.applyValue(makeThemeFromColor((colors.hex || '').substr(1)));
	}

	clear() {
		this.applyValue(null);
	}
}
