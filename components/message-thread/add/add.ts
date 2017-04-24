import Vue from 'vue';
import { State } from 'vuex-class';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./add.html';

import { AppStore } from '../../../vue/services/app/app-store';
import { AppUserAvatarImg } from '../../user/user-avatar/img/img';

@View
@Component({
	components: {
		AppUserAvatarImg,
	},
})
export class AppMessageThreadAdd extends Vue
{
	@State app: AppStore;
}
