import View from '!view!./popover.html?style=./popover.styl';
import { User } from 'game-jolt-frontend-lib/components/user/user.model';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { Api } from './../../../api/api.service';
import { AppUserCard } from './../card';

@View
@Component({
	components: {
		AppUserCard,
	},
})
export class AppUserCardPopover extends Vue {
	@Prop(User)
	user!: User;

	isLoaded = false;

	mounted() {
		this.fetchCardInfo();
	}

	async fetchCardInfo() {
		const response = await Api.sendRequest('/web/profile/card/' + this.user.id, undefined, {
			detach: true,
		});

		this.isLoaded = true;

		// Assign to the user to make sure the following status is up to date.
		this.user.assign(response.user);
	}
}
