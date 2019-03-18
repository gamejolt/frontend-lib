import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { User } from '../../user/user.model';
import { date } from '../../../vue/filters/date';
import { AppTimeAgo } from '../../time/ago/ago';
import AppUserAvatar from '../../user/user-avatar/user-avatar.vue'
import AppJolticon from '../../../vue/components/jolticon/jolticon.vue'
import AppTimelineListItem from '../../timeline-list/item/item.vue'
import AppUserCardHover from '../../user/card/hover/hover.vue'

@Component({
	components: {
		AppTimelineListItem,
		AppUserCardHover,
		AppUserAvatar,
		AppTimeAgo,
		AppJolticon,
	},
})
export default class AppMessageThreadItem extends Vue {
	@Prop(User) user!: User;
	@Prop(User) repliedTo?: User;
	@Prop(Number) date!: number;
	@Prop(String) id?: string;
	@Prop(Boolean) isActive?: boolean;
	@Prop(Boolean) isNew?: boolean;
	@Prop(Boolean) isReply?: boolean;
	@Prop(Boolean) isLast?: boolean;

	@Prop(Boolean) isShowingReplies?: boolean;

	dateFilter = date;
}
