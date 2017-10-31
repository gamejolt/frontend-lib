import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import View from '!view!./slider.html';

import { AppMediaBarLightbox } from './lightbox';
import { findRequiredVueParent } from '../../../utils/vue';

@View
@Component({})
export class AppMediaBarLightboxSlider extends Vue {
	mounted() {
		const mediaBar = findRequiredVueParent(this, AppMediaBarLightbox);
		mediaBar.setSlider(this.$el);
	}
}
