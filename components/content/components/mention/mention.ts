import View from '!view!./mention.html?style=./mention.styl';
import { ContentOwner } from 'game-jolt-frontend-lib/components/content/content-owner';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { User } from '../../../user/user.model';

@View
@Component({})
export class AppContentMention extends Vue {
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
