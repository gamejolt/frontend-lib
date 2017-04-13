import Vue from 'vue';
import { State } from 'vuex-class';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./add.html';

import { AppState } from '../../../vue/services/app/app-store';
import { AppUserAvatarImg } from '../../user/user-avatar/img/img';

@View
@Component({
	components: {
		AppUserAvatarImg,
	},
})
export class AppMessageThreadAdd extends Vue
{
	@Prop( Boolean ) nested?: boolean;

	@State app: AppState;
}
