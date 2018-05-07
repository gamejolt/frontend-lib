import { Model } from '../../model/model.service';

export class ThemePreset extends Model {
	name: string;
	highlight: string;
	backlight: string;
	notice: string;
	tint?: string;
}

Model.create(ThemePreset);

export const DefaultThemePreset = new ThemePreset({
	id: 0,
	name: 'Game Jolt',
	highlight: 'ccff00',
	backlight: '2f7f6f',
	notice: 'ff3fac',
});
