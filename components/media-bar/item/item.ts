
import * as Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./item.html?style=./item.styl';

import { Screen } from '../../screen/screen-service';
import { Analytics } from '../../analytics/analytics.service';

import { AppJolticon } from '../../../vue/components/jolticon/jolticon';
import { AppImgResponsive } from '../../img/responsive/responsive.directive.vue';
import { AppMediaBar } from '../media-bar';
import { findVueParent } from '../../../utils/vue';

@View
@Component({
	name: 'media-bar-item',
	components: {
		AppJolticon,
	},
	directives: {
		AppImgResponsive,
	},
})
export class AppMediaBarItem extends Vue
{
	@Prop( Object ) item: any;

	mediaBar: AppMediaBar;

	mounted()
	{
		this.mediaBar = findVueParent( this, AppMediaBar ) as AppMediaBar;

		// We set the dimensions on the thumbnails manually.
		// This way we can size it correct before it loads.
		if ( this.item.media_type === 'image' ) {
			const dimensions = this.item.media_item.getDimensions( 400, 150 );
			this.$el.style.width = dimensions.width + 'px';
			this.$el.style.height = dimensions.height + 'px';
		}
		else if ( this.item.media_type === 'sketchfab' ) {
			// Sketchfab thumbnails are hardcoded to this width.
			this.$el.style.height = '150px';
			this.$el.style.width = 150 / 0.5625 + 'px';
		}
		else {
			// Video thumbnails are hardcoded to this width.
			this.$el.style.width = '200px';
		}
	}

	onLoadedChange( event: CustomEvent )
	{
		if ( event.detail ) {
			this.$el.classList.add( 'loaded' );
		}
		else {
			this.$el.classList.remove( 'loaded' );
		}
	}

	onClick()
	{
		// Lightbox is turned off on mobile.
		if ( !Screen.isXs ) {
			this.mediaBar.setActiveItem( this.item );
		}
		else {
			Analytics.trackEvent( 'media-bar', 'item-click-mobile' );
		}
	}
}
