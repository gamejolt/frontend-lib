import { Node } from 'prosemirror-model';
import { EditorView, NodeView } from 'prosemirror-view';
import Vue from 'vue';

export type GetPosFunction = () => number;

export abstract class BaseNodeView implements NodeView {
	protected node: Node;
	protected view: EditorView;
	protected getPos: GetPosFunction;

	public dom: HTMLElement;

	constructor(node: Node, view: EditorView, getPos: GetPosFunction) {
		this.node = node;
		this.view = view;
		this.getPos = getPos;

		this.dom = this.createDOM();

		// This node gets mounted in the next tick
		Vue.nextTick().then(() => {
			this.mounted();
		});
	}

	protected createDOM(): HTMLElement {
		return document.createElement('div');
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
		vm.$props.isEditing = true;
		vm.$mount(container);
		vm.$on('removed', () => {
			this.removeMe();
		});
		vm.$on('updateAttrs', (attrs: object) => {
			this.updateAttrs(attrs);
		});
	}

	removeMe() {
		const tr = this.view.state.tr;
		const pos = this.view.posAtDOM(this.dom, 0);
		tr.replace(pos, pos + 1, undefined);
		this.view.dispatch(tr);
	}

	updateAttrs(attrs: any) {
		// Merge the old and new attribute lists
		const newAttrs = {} as any;
		for (const currentKey of Object.keys(this.node.attrs)) {
			newAttrs[currentKey] = this.node.attrs[currentKey];
		}
		for (const newKey of Object.keys(attrs)) {
			newAttrs[newKey] = attrs[newKey];
		}

		// Only apply changes to the node attributes
		const tr = this.view.state.tr;
		tr.setNodeMarkup(this.getPos(), undefined, newAttrs);
		this.view.dispatch(tr);
	}
}
