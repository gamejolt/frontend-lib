import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./dismissable.html';
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
	@Prop(String) alertType!: string;
	@Prop(String) dismissKey!: string;
	@Prop(Boolean) noMargin?: boolean;

	shouldShow = false;

	get _key() {
		return STORAGE_KEY_PREFIX + this.dismissKey;
	}

	mounted() {
		if (!window.localStorage.getItem(this._key)) {
			this.shouldShow = true;
		}
	}

	dismiss() {
		window.localStorage.setItem(this._key, Date.now() + '');
		this.shouldShow = false;

		this.$emit('dismiss');
	}
}
