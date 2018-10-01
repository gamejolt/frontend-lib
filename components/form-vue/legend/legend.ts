import View from '!view!./legend.html?style=./legend.styl';
import { AppButton } from 'game-jolt-frontend-lib/components/button/button';
import Vue from 'vue';
import { Component, Emit, Prop } from 'vue-property-decorator';

@View
@Component({
	components: {
		AppButton,
	},
})
export class AppFormLegend extends Vue {
	@Prop(Boolean)
	compact?: boolean;

	@Prop(Boolean)
	expandable?: boolean;

	@Prop(Boolean)
	expanded?: boolean;

	@Prop(Boolean)
	deletable?: boolean;

	@Emit('delete')
	emitDelete() {}
}
