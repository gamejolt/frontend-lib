import { Node } from 'prosemirror-model';
import { EditorView } from 'prosemirror-view';
import { AppContentEmbed } from '../../components/embed/embed';
import { ContextCapabilities } from '../../content-context';
import { ContentHydrator } from '../../content-hydrator';
import { BaseNodeView, GetPosFunction } from './base';

export class EmbedNodeView extends BaseNodeView {
	capabilities: ContextCapabilities;
	hydrator: ContentHydrator;

	constructor(
		node: Node,
		view: EditorView,
		getPos: GetPosFunction,
		capabilities: ContextCapabilities,
		hydrator: ContentHydrator
	) {
		super(node, view, getPos);

		this.capabilities = capabilities;
		this.hydrator = hydrator;
	}

	mounted() {
		const vm = new AppContentEmbed({
			propsData: {
				type: this.node.attrs.type,
				source: this.node.attrs.source,
				capabilities: this.capabilities,
				hydrator: this.hydrator,
			},
		});
		this.mountVue(vm);
	}
}
