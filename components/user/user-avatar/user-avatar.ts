import View from '!view!./user-avatar.html?style=./user-avatar.styl';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { Environment } from '../../environment/environment.service';
import { User } from '../user.model';
import { AppUserAvatarImg } from './img/img';

@View
@Component({
	components: {
		AppUserAvatarImg,
	},
})
export class AppUserAvatar extends Vue {
	@Prop(Object)
	user!: User;

	@Prop(String)
	link?: string;

	@Prop(Boolean)
	showName?: boolean;

	get href() {
		if (this.user) {
			if (!this.link) {
				return Environment.wttfBaseUrl + this.user.url;
			} else if (this.link === 'dashboard') {
				return Environment.wttfBaseUrl + '/dashboard';
			} else if (this.link === 'fireside') {
				return Environment.firesideBaseUrl + '/@' + this.user.username;
			}
		}
	}
}
