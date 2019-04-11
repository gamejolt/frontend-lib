import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import AppUserCardHover from '../../../../user/card/hover/hover.vue';
import { User } from '../../../../user/user.model';
import { ContentObject } from '../../../content-object';
import { ContentOwner } from '../../../content-owner';

// We have to build a separate view component for mentions and cannot reuse AppContentMention
// because we want to use the router-link to link to the user, which is unavailable in the editor.
@Component({
	components: {
		AppUserCardHover,
	},
})
export default class AppContentViewerMention extends Vue {
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
