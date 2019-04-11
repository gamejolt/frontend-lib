import AppContentMention from '../../components/mention/mention.vue';
import { HydratableNodeView } from './hydratable';

export class MentionNodeView extends HydratableNodeView {
	protected createDOM() {
		// We want to override the default 'div' container to be able to inline this Vue component
		return document.createElement('span');
	}

	mounted() {
		const vm = new AppContentMention({
			propsData: {
				username: this.node.attrs.value,
				owner: this.owner,
			},
		});
		this.mountVue(vm);
	}
}
