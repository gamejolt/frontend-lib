import AppContentEmbedTS from 'game-jolt-frontend-lib/components/content/components/embed/embed';
import AppContentEmbed from 'game-jolt-frontend-lib/components/content/components/embed/embed.vue';
import { ContentEditorService } from 'game-jolt-frontend-lib/components/content/content-editor/content-editor.service';
import { isChildElement } from 'game-jolt-frontend-lib/utils/dom';
import { Node } from 'prosemirror-model';
import { store } from '../../../../../../app/store';
import { router } from '../../../../../../app/views';
import { HydratableNodeView } from './hydratable';

export class EmbedNodeView extends HydratableNodeView {
	private vueComponent: AppContentEmbedTS | undefined;

	stopEvent(e: Event) {
		return e.target instanceof HTMLInputElement && isChildElement(this.dom, e.target);
	}

	update(node: Node) {
		this.node = node;
		// Update the vue component's props from the new node
		if (this.vueComponent instanceof AppContentEmbedTS) {
			this.vueComponent.$props.source = this.node.attrs.source;
			this.vueComponent.$props.type = this.node.attrs.type;
		}
		// don't handle updates to this node, so it doesn't get redrawn.
		return !node.attrs.type;
	}

	mounted() {
		this.vueComponent = new AppContentEmbed({
			store,
			router,
			propsData: {
				type: this.node.attrs.type,
				source: this.node.attrs.source,
				owner: this.owner,
				isDisabled: ContentEditorService.isDisabled(this.view),
			},
		});
		this.mountVue(this.vueComponent);
	}
}
