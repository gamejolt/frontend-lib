import View from '!view!./known.html?style=./known.styl';
import { AppTooltip } from 'game-jolt-frontend-lib/components/tooltip/tooltip';
import { AppUserCardHover } from 'game-jolt-frontend-lib/components/user/card/hover/hover';
import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { AppUserAvatar } from '../user-avatar/user-avatar';
import { User } from '../user.model';

@View
@Component({
	components: {
		AppUserCardHover,
		AppUserAvatar,
	},
	directives: {
		AppTooltip,
	},
})
export class AppKnownUsers extends Vue {
	@Prop(Array)
	users!: User[];
}
