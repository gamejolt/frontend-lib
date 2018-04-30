import { readableColor, mix, parseToRgb, rgb, desaturate, complement } from 'polished';
import { rgb2lab, lab2rgb } from '../../utils/color';
import { Model } from '../model/model.service';
import { ThemePreset } from './preset/preset.model';

// Sync with variables in stylus.
const GrayDarkest = '#111111';
const GrayDarker = '#212121';
const GrayDark = '#292929';
const Gray = '#363636';
const GraySubtle = '#444444';
const GrayLight = '#7e7e7e';
const GrayLighter = '#d1d1d1';
const GrayLightest = '#f3f3f3';

export function makeThemeFromPreset(preset: ThemePreset) {
	return new Theme({
		theme_preset_id: preset.id,
		highlight: preset.highlight,
		backlight: preset.backlight,
		notice: preset.notice,
		tint: preset.tint,
	});
}

export function makeThemeFromColor(color: string) {
	return new Theme({
		custom: color,
	});
}

export class Theme extends Model {
	highlight: string;
	backlight: string;
	notice: string;
	tint?: string;
	theme_preset_id?: number;
	custom?: string;

	constructor(data: any = {}) {
		super(data);

		this.highlight = this.highlight || 'ccff00';
		this.backlight = this.backlight || '2f7f6f';
		this.notice = this.notice || 'ff3fac';
	}

	get highlight_() {
		return this.readableCustomLight || this.highlight;
	}

	get darkHighlight_() {
		return this.readableCustomDark || this.highlight;
	}

	get backlight_() {
		return this.readableCustomLight || this.backlight;
	}

	get darkBacklight_() {
		return this.readableCustomDark || this.backlight;
	}

	get notice_() {
		return this.readableCustomLight || this.notice;
	}

	get darkNotice_() {
		return this.readableCustomDark || this.notice;
	}

	get tint_() {
		return (
			(this.custom && desaturate(0.5, complement('#' + this.custom)).substr(1)) || this.tint
		);
	}

	get highlightFg_() {
		return readableColor('#' + this.highlight_).substr(1);
	}

	get noticeFg_() {
		return readableColor('#' + this.notice_).substr(1);
	}

	get biBg_() {
		return this.readableCustomLight || this.backlight;
	}

	get biFg_() {
		return this.readableCustomLight
			? readableColor('#' + this.biBg_).substr(1)
			: this.highlight;
	}

	get darkBiBg_() {
		return this.readableCustomDark || this.highlight;
	}

	get darkBiFg_() {
		return this.highlightFg_;
	}

	get darkest_() {
		return this.tintColor(GrayDarkest, 0.02);
	}

	get darker_() {
		return this.tintColor(GrayDarker, 0.04);
	}

	get dark_() {
		return this.tintColor(GrayDark, 0.04);
	}

	get gray_() {
		return this.tintColor(Gray, 0.04);
	}

	get graySubtle_() {
		return this.tintColor(GraySubtle, 0.04);
	}

	get light_() {
		return this.tintColor(GrayLight, 0.04);
	}

	get lighter_() {
		return this.tintColor(GrayLighter, 0.04);
	}

	get lightest_() {
		return this.tintColor(GrayLightest, 0.04);
	}

	private get readableCustomDark() {
		return this.getReadableCustom('dark');
	}

	private get readableCustomLight() {
		return this.getReadableCustom('light');
	}

	private getReadableCustom(background: 'light' | 'dark') {
		if (!this.custom) {
			return undefined;
		}

		// const custom = '#' + this.custom;
		const customRGB = parseToRgb('#' + this.custom);
		const customLAB = rgb2lab([customRGB.red, customRGB.green, customRGB.blue]);

		if (background === 'light' && customLAB[0] > 80) {
			customLAB[0] = 80;
			const convertedRGB = lab2rgb(customLAB);
			return rgb(convertedRGB[0], convertedRGB[1], convertedRGB[2]).substr(1);
		} else if (background === 'dark' && customLAB[0] < 45) {
			customLAB[0] = 45;
			const convertedRGB = lab2rgb(customLAB);
			return rgb(convertedRGB[0], convertedRGB[1], convertedRGB[2]).substr(1);
		}

		return this.custom;
	}

	private tintColor(color: string, amount: number) {
		return (this.tint_ ? mix(amount, '#' + this.tint_, color) : color).substr(1);
	}
}

Model.create(Theme);
