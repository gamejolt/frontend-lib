import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./user-avatar.html?style=./user-avatar.styl';

import { User } from '../user.model';
import { Environment } from '../../environment/environment.service';
import { AppUserAvatarImg } from './img/img';

@View
@Component({
	components: {
		AppUserAvatarImg,
	},
})
export class AppUserAvatar extends Vue {
	@Prop([Object])
	user: User;
	@Prop([String])
	link?: string;
	@Prop([Boolean])
	showName?: boolean;

	href = '';

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
}
