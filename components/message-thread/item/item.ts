import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./item.html?style=./item.styl';

import { User } from '../../user/user.model';
import { date } from '../../../vue/filters/date';
import { AppTimeAgo } from '../../time/ago/ago';
import { AppUserAvatar } from '../../user/user-avatar/user-avatar';
import { AppJolticon } from '../../../vue/components/jolticon/jolticon';

@View
@Component({
	components: {
		AppUserAvatar,
		AppTimeAgo,
		AppJolticon,
	},
})
export class AppMessageThreadItem extends Vue {
	@Prop([User])
	user: User;
	@Prop([User])
	repliedTo?: User;
	@Prop([Number])
	date: number;
	@Prop([String])
	id?: string;
	@Prop([Boolean])
	isActive?: boolean;
	@Prop([Boolean])
	isNew?: boolean;

	dateFilter = date;
}
