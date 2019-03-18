import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { findRequiredVueParent } from '../../../utils/vue';
import { AppMediaBarLightbox } from './lightbox';

@Component({})
export default class AppMediaBarLightboxSlider extends Vue {
	mounted() {
		const mediaBar = findRequiredVueParent(this, AppMediaBarLightbox);
		mediaBar.setSlider(this.$el as HTMLElement);
	}
}
