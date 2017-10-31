import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import View from '!view!./widget.html';

import { Api } from '../../api/api.service';
import { Graph } from '../graph.service';
import { AppLoading } from '../../../vue/components/loading/loading';
import { AppGraph } from '../graph';

@View
@Component({
	components: {
		AppLoading,
		AppGraph,
	},
})
export class AppGraphWidget extends Vue {
	@Prop(String) url: string;

	isLoading = true;
	graphData: any = null;

	@Watch('url', { immediate: true })
	async onUrlChange() {
		this.isLoading = true;

		const response = await Api.sendRequest(this.url, null, { detach: true });

		if (response.data && Array.isArray(response.data)) {
			this.graphData = Graph.createGraphData(response.data);
		}

		this.isLoading = false;
	}
}
