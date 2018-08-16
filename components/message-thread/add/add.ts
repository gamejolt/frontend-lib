import Vue from 'vue';
import { State } from 'vuex-class';
import { Component } from 'vue-property-decorator';
import View from '!view!./add.html';

import { AppStore } from '../../../vue/services/app/app-store';
import { AppUserAvatarImg } from '../../user/user-avatar/img/img';
import { AppTimelineListItem } from '../../timeline-list/item/item';

@View
@Component({
	components: {
		AppUserAvatarImg,
		AppTimelineListItem,
	},
})
export class AppMessageThreadAdd extends Vue {
	@State app!: AppStore;
}
