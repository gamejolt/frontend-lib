import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./item.html?style=./item.styl';

import { Screen } from '../../screen/screen-service';
import { Analytics } from '../../analytics/analytics.service';

import { AppJolticon } from '../../../vue/components/jolticon/jolticon';
import { AppImgResponsive } from '../../img/responsive/responsive';
import { AppMediaBar } from '../media-bar';
import { findRequiredVueParent } from '../../../utils/vue';

@View
@Component({
	components: {
		AppJolticon,
		AppImgResponsive,
	},
})
export class AppMediaBarItem extends Vue {
	@Prop(Object) item: any;

	mediaBar: AppMediaBar;
	width = 'auto';
	height = 'auto';

	created() {
		this.mediaBar = findRequiredVueParent(this, AppMediaBar);

		// We set the dimensions on the thumbnails manually.
		// This way we can size it correct before it loads.
		if (this.item.media_type === 'image') {
			const dimensions = this.item.media_item.getDimensions(400, 150);
			this.width = dimensions.width + 'px';
			this.height = dimensions.height + 'px';
		} else if (this.item.media_type === 'sketchfab') {
			// Sketchfab thumbnails are hardcoded to this width.
			this.height = '150px';
			this.width = 150 / 0.5625 + 'px';
		} else {
			// Video thumbnails are hardcoded to this width.
			this.width = '200px';
		}
	}

	onClick() {
		this.mediaBar.setActiveItem(this.item);
	}
}
