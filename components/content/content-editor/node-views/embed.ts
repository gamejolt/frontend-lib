import { AppContentEmbed } from '../../components/embed/embed';
import { HydratableNodeView } from './hydratable';

export class EmbedNodeView extends HydratableNodeView {
	mounted() {
		const vm = new AppContentEmbed({
			propsData: {
				type: this.node.attrs.type,
				source: this.node.attrs.source,
				owner: this.owner,
			},
		});
		this.mountVue(vm);
	}
}
