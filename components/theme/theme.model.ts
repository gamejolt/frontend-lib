import { readableColor, mix } from 'polished';

// Sync with variables in stylus.
const GrayDarkest = '#111111';
const GrayDarker = '#212121';
const GrayDark = '#292929';
const Gray = '#363636';
const GraySubtle = '#444444';
const GrayLight = '#7e7e7e';
const GrayLighter = '#d1d1d1';
const GrayLightest = '#f3f3f3';

interface PayloadTheme {
	highlight?: string;
	backlight?: string;
	notice?: string;
	tint?: string;
	custom?: string;
}

export class ThemeModel {
	public highlight = '#ccff00';
	public backlight = '#2f7f6f';
	public notice = '#ff3fac';
	public tint: string | null = null;

	static fromPayload(payloadTheme: PayloadTheme) {
		const theme = new ThemeModel();

		if (payloadTheme.custom) {
		} else {
			if (payloadTheme.highlight) {
				theme.highlight = '#' + payloadTheme.highlight;
			}

			if (payloadTheme.backlight) {
				theme.backlight = '#' + payloadTheme.backlight;
			}

			if (payloadTheme.notice) {
				theme.notice = '#' + payloadTheme.notice;
			}

			if (payloadTheme.tint) {
				theme.tint = '#' + payloadTheme.tint;
			}
		}

		return theme;
	}

	get highlightFg() {
		return readableColor(this.highlight);
	}

	get noticeFg() {
		return readableColor(this.notice);
	}

	get darkest() {
		return this.tintColor(GrayDarkest, 0.02);
	}

	get darker() {
		return this.tintColor(GrayDarker, 0.04);
	}

	get dark() {
		return this.tintColor(GrayDark, 0.04);
	}

	get gray() {
		return this.tintColor(Gray, 0.04);
	}

	get graySubtle() {
		return this.tintColor(GraySubtle, 0.04);
	}

	get light() {
		return this.tintColor(GrayLight, 0.04);
	}

	get lighter() {
		return this.tintColor(GrayLighter, 0.04);
	}

	get lightest() {
		return this.tintColor(GrayLightest, 0.04);
	}

	private tintColor(color: string, amount: number) {
		return this.tint ? mix(amount, this.tint, color) : color;
	}
}
