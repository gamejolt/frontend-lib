import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./hover.html';

import { User } from '../../user.model';
import { AppUserCard } from '../card';
import { AppPopper } from '../../../popper/popper';

@View
@Component({
	components: {
		AppPopper,
		AppUserCard,
	},
})
export class AppUserCardHover extends Vue {
	@Prop(User) user?: User;

	get shouldShow() {
		return !!this.user;
	}
}
