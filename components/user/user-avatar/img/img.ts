import * as Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./img.html?style=./img.styl';

import { User } from '../../user.model';

@View
@Component({
	name: 'user-avatar-img',
})
export class AppUserAvatarImg extends Vue
{
	@Prop( Object ) user?: User;
}
