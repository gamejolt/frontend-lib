import Vue from 'vue';
import { State } from 'vuex-class';
import { Component, Prop } from 'vue-property-decorator';

import { AppStore } from '../../../vue/services/app/app-store';
import AppUserAvatarImg from '../../user/user-avatar/img/img.vue'
import AppTimelineListItem from '../../timeline-list/item/item.vue'

@Component({
	components: {
		AppUserAvatarImg,
		AppTimelineListItem,
	},
})
export default class AppMessageThreadAdd extends Vue {
	@Prop(Boolean) hideMessageSplit!: boolean;

	@State app!: AppStore;
}
