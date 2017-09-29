import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';
import * as View from '!view!./follow-widget.html';

import { AppJolticon } from '../../../vue/components/jolticon/jolticon';
import { AppAuthRequired } from '../../auth/auth-required-directive.vue';
import { AppTrackEvent } from '../../analytics/track-event.directive.vue';
import { AppTooltip } from '../../tooltip/tooltip';
import { number } from '../../../vue/filters/number';
import { User } from '../user.model';
import { AppStore } from '../../../vue/services/app/app-store';
import { Growls } from '../../growls/growls.service';
import { findTooltipContainer } from '../../tooltip/container/container';

@View
@Component({
	components: {
		AppJolticon,
	},
	directives: {
		AppAuthRequired,
		AppTrackEvent,
		AppTooltip,
	},
	filters: {
		number,
	},
})
export class AppUserFollowWidget extends Vue {
	@Prop(User) user: User;
	@Prop(String) size?: string;
	@Prop(Boolean) sparse?: boolean;
	@Prop(Boolean) outline?: boolean;
	@Prop(String) eventLabel?: string;

	@State app: AppStore;

	isProcessing = false;

	get tooltipContainer() {
		return findTooltipContainer(this);
	}

	async onClick() {
		if (!this.app.user || this.isProcessing) {
			return;
		}

		this.isProcessing = true;

		if (!this.user.is_following) {
			try {
				await this.user.$follow();
			} catch (e) {
				Growls.error(this.$gettext(`Something has prevented you from following this user.`));
			}
		} else {
			try {
				await this.user.$unfollow();
			} catch (e) {
				Growls.error(this.$gettext(`For some reason we couldn't unfollow this user.`));
			}
		}

		this.isProcessing = false;
	}
}
