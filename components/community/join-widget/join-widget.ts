import View from '!view!./join-widget.html';
import { AppTrackEvent } from 'game-jolt-frontend-lib/components/analytics/track-event.directive.vue';
import { AppAuthRequired } from 'game-jolt-frontend-lib/components/auth/auth-required-directive.vue';
import {
	$joinCommunity,
	$leaveCommunity,
	Community,
} from 'game-jolt-frontend-lib/components/community/community.model';
import { Growls } from 'game-jolt-frontend-lib/components/growls/growls.service';
import { findTooltipContainer } from 'game-jolt-frontend-lib/components/tooltip/container/container';
import { AppTooltip } from 'game-jolt-frontend-lib/components/tooltip/tooltip';
import { number } from 'game-jolt-frontend-lib/vue/filters/number';
import { AppStore } from 'game-jolt-frontend-lib/vue/services/app/app-store';
import Vue from 'vue';
import { Component, Emit, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { GridClient } from '../../../../../app/components/grid/client.service';

@View
@Component({
	directives: {
		AppAuthRequired,
		AppTrackEvent,
		AppTooltip,
	},
})
export class AppCommunityJoinWidget extends Vue {
	@Prop(Community)
	community!: Community;

	@Prop(Boolean)
	block?: boolean;

	@Prop(Boolean)
	hideCount?: boolean;

	@Prop(String)
	eventLabel?: string;

	@State
	app!: AppStore;

	@State
	grid!: GridClient;

	isProcessing = false;

	get badge() {
		return !this.hideCount && this.community.member_count
			? number(this.community.member_count)
			: '';
	}

	get tooltipContainer() {
		return findTooltipContainer(this);
	}

	get tooltip() {
		// TODO
		return undefined;
		// return !this.community.is_member
		// 	? this.$gettext(`Join this community to save it !`)
		// 	: undefined;
	}

	get myEventLabel() {
		return `community-follow:${this.eventLabel || 'any'}:${
			!this.community.is_member ? 'join' : 'leave'
		}`;
	}

	@Emit('join')
	join(_community: Community) {}

	@Emit('leave')
	leave(_community: Community) {}

	async onClick() {
		if (!this.app.user || this.isProcessing) {
			return;
		}

		this.isProcessing = true;

		if (!this.community.is_member) {
			try {
				await $joinCommunity(this.community);
				this.grid.joinCommunity(this.community);
				this.join(this.community);
			} catch (e) {
				Growls.error(
					this.$gettext(`Something has prevented you from joining this community.`)
				);
			}
		} else {
			try {
				await $leaveCommunity(this.community);
				this.grid.leaveCommunity(this.community);
				this.leave(this.community);
			} catch (e) {
				Growls.error(this.$gettext(`For some reason we couldn't leave this community.`));
			}
		}

		this.isProcessing = false;
	}
}
