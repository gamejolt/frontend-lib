import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./card.html?style=./card.styl';
import { State } from 'vuex-class';

import { User } from '../user.model';
import { AppUserFollowWidget } from '../follow-widget/follow-widget';
import { AppJolticon } from '../../../vue/components/jolticon/jolticon';
import { AppTooltip } from '../../tooltip/tooltip';
import { number } from '../../../vue/filters/number';
import { Api } from '../../api/api.service';
import { AppLoading } from '../../../vue/components/loading/loading';
import { AppTooltipContainer } from '../../tooltip/container/container';
import { AppUserAvatarImg } from '../user-avatar/img/img';
import { Store } from '../../../../../app/store/index';
import { AppTheme } from '../../theme/theme';

@View
@Component({
	components: {
		AppJolticon,
		AppUserAvatarImg,
		AppUserFollowWidget,
		AppLoading,
		AppTheme,
		AppTooltipContainer,
	},
	directives: {
		AppTooltip,
	},
	filters: {
		number,
	},
})
export class AppUserCard extends Vue {
	@Prop(User) user!: User;
	@Prop(Boolean) showExtraInfo!: boolean;

	@State app!: Store['app'];

	isLoaded = false;
	gamesCount = 0;
	videosCount = 0;

	mounted() {
		if (this.showExtraInfo) {
			this.fetchCardInfo();
		}
	}

	async fetchCardInfo() {
		const response = await Api.sendRequest('/web/profile/card/' + this.user.id, undefined, {
			detach: true,
		});
		this.gamesCount = response.gamesCount || 0;
		this.videosCount = response.videosCount || 0;
		this.isLoaded = true;

		// Assign to the user to make sure the following status is up to date.
		this.user.assign(response.user);
	}
}
