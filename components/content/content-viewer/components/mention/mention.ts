import View from '!view!./mention.html?style=./mention.styl';
import { ContentObject } from 'game-jolt-frontend-lib/components/content/content-object';
import { ContentOwner } from 'game-jolt-frontend-lib/components/content/content-owner';
import { AppUserCardHover } from 'game-jolt-frontend-lib/components/user/card/hover/hover';
import { User } from 'game-jolt-frontend-lib/components/user/user.model';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

// We have to build a separate view component for mentions and cannot reuse AppContentMention
// because we want to use the router-link to link to the user, which is unavailable in the editor.
@View
@Component({
	components: {
		AppUserCardHover,
	},
})
export class AppContentViewerMention extends Vue {
	@Prop(ContentObject)
	data!: ContentObject;
	@Prop(Object)
	owner!: ContentOwner;

	user: User | null = null;

	get username() {
		return this.data.attrs.value;
	}

	async mounted() {
		const hydratedData = await this.owner
			.getHydrator()
			.getData('username', this.data.attrs.value);
		if (hydratedData) {
			this.user = new User(hydratedData);
		}
	}
}
