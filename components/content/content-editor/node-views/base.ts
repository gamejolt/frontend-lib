import { Node } from 'prosemirror-model';
import { EditorView, NodeView } from 'prosemirror-view';
import Vue from 'vue';

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
		// This node gets mounted in the next tick
		Vue.nextTick().then(() => {
			this.mounted();
		});
	}

	mounted(): void {}

	destroy() {
		// Clean up dom element when this view gets removed
		this.dom.remove();
	}

	protected mountVue(vm: Vue) {
		// Mount the Vue instance onto an inner div to not disturb the div managed by the prosemirror editor
		const container = document.createElement('div');
		this.dom.appendChild(container);
		vm.$mount(container);
	}
}
