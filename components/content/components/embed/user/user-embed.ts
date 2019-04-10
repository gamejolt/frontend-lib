import { ContentHydrator } from 'game-jolt-frontend-lib/components/content/content-hydrator';
import AppUserCard from 'game-jolt-frontend-lib/components/user/card/card.vue';
import { User } from 'game-jolt-frontend-lib/components/user/user.model';
import AppLoading from 'game-jolt-frontend-lib/vue/components/loading/loading.vue';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@Component({
	components: {
		AppUserCard,
		AppLoading,
	},
})
export default class AppContentEmbedUserEmbed extends Vue {
	@Prop(String)
	username!: string;

	@Prop(ContentHydrator)
	hydrator!: ContentHydrator;

	user: User | null = null;
	hasError = false;

	get isHydrated() {
		return !!this.user;
	}

	get errorMessage() {
		return this.$gettextInterpolate(
			'Failed to load user information for user @%{ username }.',
			{ username: this.username }
		);
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
