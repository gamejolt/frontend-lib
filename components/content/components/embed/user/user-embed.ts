import View from '!view!./user-embed.html?style=./user-embed.styl';
import { User } from 'game-jolt-frontend-lib/components/user/user.model';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { AppUserCard } from '../../../../user/card/card';
import { ContentHydrator } from '../../../content-hydrator';

@View
@Component({
	components: {
		AppUserCard,
	},
})
export class AppContentEmbedUserEmbed extends Vue {
	@Prop(String)
	username!: string;

	@Prop(ContentHydrator)
	hydrator!: ContentHydrator;

	user: User | null = null;
	hasError = false;

	get isHydrated() {
		return !!this.user;
	}

	mounted() {
		this.loadUser();
	}

	async loadUser() {
		const hydratedData = await this.hydrator.getData('username', this.username);
		if (hydratedData !== null) {
			this.user = new User(hydratedData);
		} else {
			this.hasError = true;
		}
	}
}
