import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./user-avatar.html?style=./user-avatar.styl';

import { User } from '../user.model';
import { Environment } from '../../environment/environment.service';
import { AppUserAvatarImg } from './img/img';
import { AppPopover } from '../../popover/popover';
import { AppPopoverTrigger } from '../../popover/popover-trigger.directive.vue';
import { Screen } from '../../screen/screen-service';
import { AppUserCard } from '../card/card';

@View
@Component({
	components: {
		AppUserAvatarImg,
		AppPopover,
		AppUserCard,
	},
	directives: {
		AppPopoverTrigger,
	},
})
export class AppUserAvatar extends Vue {
	@Prop(Object) user: User;
	@Prop(String) link?: string;
	@Prop(Boolean) showName?: boolean;
	@Prop(Boolean) showHoverCard?: boolean;

	href = '';

	private isHoverCardBootstrapped = false;

	get shouldShowHoverCard() {
		return this.showHoverCard && Screen.isDesktop;
	}

	created() {
		if (this.user) {
			if (!this.link) {
				this.href = Environment.wttfBaseUrl + this.user.url;
			} else if (this.link === 'dashboard') {
				this.href = Environment.wttfBaseUrl + '/dashboard';
			} else if (this.link === 'fireside') {
				this.href = Environment.firesideBaseUrl + '/@' + this.user.username;
			}
		}
	}

	onCardShown() {
		this.isHoverCardBootstrapped = true;
	}
}
