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
	@Prop(String) url?: string;
	@Prop(Promise) load?: Promise<any>;
	@Prop(Object) data?: any;

	isLoaded = false;

	async mounted() {
		let payload;
		if (this.url) {
			payload = await Api.sendRequest(this.url, this.data || undefined, {
				detach: true,
			});
		} else if (this.load) {
			payload = await this.load;
		}

		this.isLoaded = true;
		this.$emit('loaded', payload);
	}
}
