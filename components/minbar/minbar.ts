import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import View from '!view!./minbar.html?style=./minbar.styl';

import { Screen } from '../screen/screen-service';
import { AppTooltip } from '../tooltip/tooltip';
import { Minbar, MinbarItem } from './minbar.service';

@View
@Component({
	directives: {
		AppTooltip,
	},
})
export class AppMinbar extends Vue {
	readonly Minbar = Minbar;
	readonly Screen = Screen;

	onItemClick(item: MinbarItem) {
		if (item.onClick) {
			item.onClick();
		}
	}
}
