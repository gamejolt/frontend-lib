import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./loader.html';

import { Api } from '../../api/api.service';
import { AppLoading } from '../../../vue/components/loading/loading';

@View
@Component({
	components: {
		AppLoading,
	},
})
export class AppFormLoader extends Vue {
	@Prop([String])
	url: string;

	isLoaded = false;

	async mounted() {
		const payload = await Api.sendRequest(this.url, undefined, {
			detach: true,
		});

		this.isLoaded = true;
		this.$emit('loaded', payload);
	}
}
