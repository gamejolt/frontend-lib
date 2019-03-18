import View from '!view!./follow-widget.html';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { number } from '../../../vue/filters/number';
import { AppStore } from '../../../vue/services/app/app-store';
import { AppTrackEvent } from '../../analytics/track-event.directive';
import { AppAuthRequired } from '../../auth/auth-required-directive';
import { Growls } from '../../growls/growls.service';
import { findTooltipContainer } from '../../tooltip/container/container';
import { AppTooltip } from '../../tooltip/tooltip';
import { User } from '../user.model';

@View
@Component({
	directives: {
		AppAuthRequired,
		AppTrackEvent,
		AppTooltip,
	},
})
export class AppUserFollowWidget extends Vue {
	@Prop(User)
	user!: User;

	@Prop(Boolean)
	overlay?: boolean;

	@Prop(Boolean)
	circle?: boolean;

	@Prop(Boolean)
	block?: boolean;

	@Prop(Boolean)
	sm?: boolean;

	@Prop(Boolean)
	hideCount?: boolean;

	@Prop(String)
	eventLabel?: string;

	@State
	app!: AppStore;

	get shouldShow() {
		return !this.app.user || this.app.user.id !== this.user.id;
	}

	get badge() {
		return !this.circle && !this.hideCount && this.user.follower_count
			? number(this.user.follower_count)
			: '';
	}

	get tooltipContainer() {
		return findTooltipContainer(this);
	}

	get tooltip() {
		return !this.user.is_following
			? this.$gettext(`Follow this user to get their games, videos, and posts in your feed!`)
			: undefined;
	}

	get icon() {
		if (!this.circle) {
			return '';
		}

		return !this.user.is_following ? 'subscribe' : 'subscribed';
	}

	async onClick() {
		if (!this.app.user) {
			return;
		}

		if (!this.user.is_following) {
			try {
				await this.user.$follow();
			} catch (e) {
				Growls.error(
					this.$gettext(`Something has prevented you from following this user.`)
				);
			}
		} else {
			try {
				await this.user.$unfollow();
			} catch (e) {
				Growls.error(this.$gettext(`For some reason we couldn't unfollow this user.`));
			}
		}
	}
}
