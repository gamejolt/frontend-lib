import { Node } from 'prosemirror-model';
import { EditorView, NodeView } from 'prosemirror-view';

export type GetPosFunction = () => number;

export abstract class BaseNodeView implements NodeView {
	protected node: Node;
	protected view: EditorView;
	protected getPost: GetPosFunction;

	public dom: HTMLElement;

	constructor(node: Node, view: EditorView, getPos: GetPosFunction) {
		this.node = node;
		this.view = view;
		this.getPost = getPos;

		this.dom = document.createElement('div');
	}

	destroy() {
		// Clean up dom element when this view gets removed
		this.dom.remove();
	}
}
