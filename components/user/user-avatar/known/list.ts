import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { AppTooltip } from '../../../../components/tooltip/tooltip';
import { User } from '../../user.model';
import AppUserAvatar from '../user-avatar.vue';

@Component({
	components: {
		AppUserAvatar,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppUserAvatarList extends Vue {
	@Prop(Array)
	users!: User[];
}
