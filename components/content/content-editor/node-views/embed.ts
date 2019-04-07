import { isChildElement } from 'game-jolt-frontend-lib/utils/dom';
import { Node } from 'prosemirror-model';
import { store } from '../../../../../../app/store';
import { router } from '../../../../../../app/views';
import { AppContentEmbed } from '../../components/embed/embed';
import { HydratableNodeView } from './hydratable';

export class EmbedNodeView extends HydratableNodeView {
	private vueComponent: AppContentEmbed | undefined;

	stopEvent(e: Event) {
		return e.target instanceof HTMLInputElement && isChildElement(this.dom, e.target);
	}

	update(node: Node) {
		this.node = node;
		// Update the vue component's props from the new node
		if (this.vueComponent instanceof AppContentEmbed) {
			this.vueComponent.$props.source = this.node.attrs.source;
			this.vueComponent.$props.type = this.node.attrs.type;
		}
		// don't handle updates to this node, so it doesn't get redrawn.
		if (!node.attrs.type) {
			return true;
		}
	}

	mounted() {
		this.vueComponent = new AppContentEmbed({
			store,
			router,
			propsData: {
				type: this.node.attrs.type,
				source: this.node.attrs.source,
				owner: this.owner,
			},
		});
		this.mountVue(this.vueComponent);
	}
}
