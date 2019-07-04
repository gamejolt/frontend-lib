import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { AppTooltip } from '../../tooltip/tooltip';
import { User } from '../user.model';

@Component({
	directives: {
		AppTooltip,
	},
})
export default class AppUserVerifiedTick extends Vue {
	@Prop(User)
	user!: User;

	@Prop(Boolean)
	highlight!: boolean;

	@Prop(Boolean)
	big!: boolean;

	@Prop(Boolean)
	small!: boolean;

	@Prop(Boolean)
	verticalAlign!: boolean;
}
