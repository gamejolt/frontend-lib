import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./item.html?style=./item.styl';

import { User } from '../../user/user.model';
import { date } from '../../../vue/filters/date';
import { AppTimeAgo } from '../../time/ago/ago';
import { AppUserAvatar } from '../../user/user-avatar/user-avatar';
import { AppJolticon } from '../../../vue/components/jolticon/jolticon';
import { AppTimelineListItem } from '../../timeline-list/item/item';

@View
@Component({
	components: {
		AppTimelineListItem,
		AppUserAvatar,
		AppTimeAgo,
		AppJolticon,
	},
})
export class AppMessageThreadItem extends Vue {
	@Prop(User) user: User;
	@Prop(User) repliedTo?: User;
	@Prop(Number) date: number;
	@Prop(String) id?: string;
	@Prop(Boolean) isActive?: boolean;
	@Prop(Boolean) isNew?: boolean;
	@Prop(Boolean) isReply?: boolean;
	@Prop(Boolean) isLast?: boolean;
	@Prop(Boolean) isPinned?: boolean;

	@Prop(Boolean) isShowingReplies?: boolean;

	dateFilter = date;
}
