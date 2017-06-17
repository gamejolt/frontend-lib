import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./fade.html?style=./fade.styl';

import { AppLoading } from '../../../vue/components/loading/loading';

@View
@Component({
	components: {
		AppLoading,
	},
})
export class AppLoadingFade extends Vue {
	@Prop(Boolean) isLoading: boolean;
	@Prop(Number) slotId: number;
}
