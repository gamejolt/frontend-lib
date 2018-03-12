import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./button.html?style=./button-new.styl';

import { AppJolticon } from '../../vue/components/jolticon/jolticon';

@View
@Component({
	components: {
		AppJolticon,
	},
})
export class AppButton extends Vue {
	@Prop({ type: String, default: 'a' })
	tag: string;
	@Prop(Boolean) primary?: boolean;
	@Prop(Boolean) trans?: boolean;
	@Prop(Boolean) filled?: boolean;
	@Prop(Boolean) dark?: boolean;
	@Prop(Boolean) overlay?: boolean;
	@Prop(Boolean) active?: boolean;
	@Prop(Boolean) sparse?: boolean;
	@Prop(Boolean) circle?: boolean;
	@Prop(Boolean) lg?: boolean;
	@Prop(Boolean) sm?: boolean;
	@Prop(Boolean) block?: boolean;
	@Prop(String) icon?: string;
	@Prop(String) badge?: string;
}
