import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import AppUserCardHover from '../../../../user/card/hover/hover.vue';
import { User } from '../../../../user/user.model';
import { ContentOwner } from '../../../content-owner';

@Component({
	components: {
		AppUserCardHover,
	},
})
export default class AppContentViewerMention extends Vue {
	@Prop(String)
	username!: string;
	@Prop(Object)
	owner!: ContentOwner;

	user: User | null = null;

	created() {
		this.owner
			.getHydrator()
			.getData('username', this.username)
			.then(hydratedData => {
				this.user = new User(hydratedData);
			});
	}
}
