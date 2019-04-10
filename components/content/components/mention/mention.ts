import { ContentOwner } from 'game-jolt-frontend-lib/components/content/content-owner';
import { User } from 'game-jolt-frontend-lib/components/user/user.model';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@Component({})
export default class AppContentMention extends Vue {
	@Prop(String)
	username!: string;

	@Prop(Object)
	owner!: ContentOwner;

	user: User | null = null;

	get isHydrated() {
		return !!this.user;
	}

	async mounted() {
		const hydratedData = await this.owner.getHydrator().getData('username', this.username);
		if (hydratedData) {
			this.user = new User(hydratedData);
		}
	}
}
