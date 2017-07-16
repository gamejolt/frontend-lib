import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./slider.html';

import { AppMediaBarLightbox } from './lightbox';
import { findVueParent } from '../../../utils/vue';

@View
@Component({})
export class AppMediaBarLightboxSlider extends Vue {
	mounted() {
		const mediaBar = findVueParent(this, AppMediaBarLightbox) as AppMediaBarLightbox;
		mediaBar.setSlider(this.$el);
	}
}
