import { Node } from 'prosemirror-model';
import { EditorView } from 'prosemirror-view';
import { AppContentEmbed } from '../../components/embed/embed';
import { ContextCapabilities } from '../../content-context';
import { BaseNodeView, GetPosFunction } from './base';

export class EmbedNodeView extends BaseNodeView {
	capabilities: ContextCapabilities;

	constructor(
		node: Node,
		view: EditorView,
		getPos: GetPosFunction,
		capabilities: ContextCapabilities
	) {
		super(node, view, getPos);

		this.capabilities = capabilities;
	}

	mounted() {
		const vm = new AppContentEmbed({
			propsData: {
				type: this.node.attrs.type,
				source: this.node.attrs.source,
				capabilities: this.capabilities,
			},
		});
		this.mountVue(vm);
	}
}
