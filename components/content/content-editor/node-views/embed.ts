import { store } from '../../../../../../app/store';
import { router } from '../../../../../../app/views';
import { AppContentEmbed } from '../../components/embed/embed';
import { HydratableNodeView } from './hydratable';

export class EmbedNodeView extends HydratableNodeView {
	mounted() {
		const vm = new AppContentEmbed({
			store,
			router,
			propsData: {
				type: this.node.attrs.type,
				source: this.node.attrs.source,
				owner: this.owner,
			},
		});
		this.mountVue(vm);
	}
}
