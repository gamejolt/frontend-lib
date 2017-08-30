import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./dismissable.html';
import { AppExpand } from '../../expand/expand';
import { AppJolticon } from '../../../vue/components/jolticon/jolticon';

const STORAGE_KEY_PREFIX = 'dismiss-alert:';

@View
@Component({
	components: {
		AppExpand,
		AppJolticon,
	},
})
export class AppAlertDismissable extends Vue {
	@Prop(String) alertType: string;
	@Prop(String) dismissKey: string;
	@Prop(Boolean) noMargin?: boolean;

	shouldShow = false;

	created() {
		this.shouldShow = false;

		if (!localStorage.getItem(STORAGE_KEY_PREFIX + this.dismissKey)) {
			this.shouldShow = true;
		}
	}

	dismiss() {
		localStorage.setItem(STORAGE_KEY_PREFIX + this.dismissKey, '1');
		this.shouldShow = false;

		this.$emit('dismiss');
	}
}
