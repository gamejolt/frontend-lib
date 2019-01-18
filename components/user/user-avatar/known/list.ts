import View from '!view!./list.html?style=./list.styl';
import { AppTooltip } from 'game-jolt-frontend-lib/components/tooltip/tooltip';
import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { User } from '../../user.model';
import { AppUserAvatar } from '../user-avatar';

@View
@Component({
	components: {
		AppUserAvatar,
	},
	directives: {
		AppTooltip,
	},
})
export class AppUserAvatarList extends Vue {
	@Prop(Array)
	users!: User[];
}
