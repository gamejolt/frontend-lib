import { AppContentEmbed } from '../../components/embed/embed';
import { BaseNodeView } from './base';

export class EmbedNodeView extends BaseNodeView {
	mounted() {
		const vm = new AppContentEmbed({
			propsData: {
				type: this.node.attrs.embedType,
				source: this.node.attrs.embedSource,
			},
		});
		this.mountVue(vm);
	}
}
