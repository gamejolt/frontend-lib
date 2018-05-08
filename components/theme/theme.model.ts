import {
	readableColor,
	mix,
	parseToRgb,
	rgb,
	desaturate,
	complement,
	parseToHsl,
	hsl,
} from 'polished';
import { rgb2lab, lab2rgb, rgb2hsl } from '../../utils/color';
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

// For clamping custom colors.
const MaxLightness = 0.8;
const MinLightness = 0.45;
const BlueBoost = 0.2;

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

/**
 * Transform a 0-to-1 range to map to an arbitrary A-to-B range. e.g. If amount is 0.5, and range is
 * 100 to 200, then return 150. e.g. lerp(100, 200, 0.5) returns 150.
 */
function lerp(low: number, high: number, amount: number) {
	return low * (1 - amount) + high * amount;
}

/**
 * Transform an arbitrary A-to-B range to map to a 0-to-1 range. e.g. If amount is 150, and range is
 * 100 to 200, then return 0.5. e.g. unlerp(100, 200, 150) returns 0.5.
 */
function unlerp(low: number, high: number, amount: number) {
	return (amount - low) / (high - low);
}

/**
 * Transform an arbitrary A-to-B range to map to an arbitrary C-to-D range. e.g. If val is 150,
 * input range is 100 to 200, and output range is 0 to 10, return 5. e.g. remap(150, 100, 200, 0,
 * 10) returns 5.
 */
function remap(val: number, inLow: number, inHigh: number, outLow: number, outHigh: number) {
	return lerp(outLow, outHigh, unlerp(inLow, inHigh, val));
}

function biRamp(
	val: number,
	aInLow: number,
	bInHigh: number,
	cInLow: number,
	outMin: number,
	outMax: number
) {
	var out = outMin;
	if (val >= aInLow && val < bInHigh) {
		out = remap(val, aInLow, bInHigh, outMin, outMax);
	} else if (val >= bInHigh && val <= cInLow) {
		// "C" then "B", because we're ramping back down.
		out = remap(val, cInLow, bInHigh, outMin, outMax);
	}

	return out;
}

function clamp(val: number, min: number, max: number) {
	if (val > max) {
		return max;
	} else if (val < min) {
		return min;
	}
	return val;
}

function getReadableCustom(custom: string | undefined, background: 'light' | 'dark') {
	if (!custom) {
		return undefined;
	}

	const initialRgb = parseToRgb('#' + custom);
	const initialHsl = parseToHsl('#' + custom);
	const labColor = rgb2lab(initialRgb);

	if (background === 'light' && labColor[0] > MaxLightness * 100) {
		// For light we just clamp the lightness value to a max.
		labColor[0] = MaxLightness * 100;
		const convertedRgb = lab2rgb(labColor);
		return rgb(convertedRgb).substr(1);
	} else if (background === 'dark' && labColor[0] < 45) {
		// For dark we clamp the lightness to a min, but have to compensate for blue.
		const clamped = clamp(
			labColor[0] / 100,
			// Note: 180 = Cyan, 240 = Blue, 300 = Purple.
			MinLightness + biRamp(initialHsl.hue, 180, 240, 300, 0, BlueBoost),
			1
		);
		labColor[0] = clamped * 100;
		const convertedRgb = lab2rgb(labColor);
		const convertedHsl = rgb2hsl(convertedRgb);

		// Use the original hue and only use the saturation/lightness from the clamped value.
		return hsl(initialHsl.hue, convertedHsl.saturation, convertedHsl.lightness).substr(1);
	}

	return custom;
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
		return getReadableCustom(this.custom, 'dark');
	}

	private get readableCustomLight() {
		return getReadableCustom(this.custom, 'light');
	}

	private tintColor(color: string, amount: number) {
		return (this.tint_ ? mix(amount, '#' + this.tint_, color) : color).substr(1);
	}
}

Model.create(Theme);
