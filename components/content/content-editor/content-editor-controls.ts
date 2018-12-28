import { EditorState, Plugin } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

export const ContentEditorControlsPlugin = new Plugin({
	view(editorView) {
		return new ContentEditorControls(editorView);
	},
});

class ContentEditorControls {
	container: HTMLDivElement;
	view: EditorView;

	constructor(view: EditorView) {
		this.container = document.createElement('div');
		this.view = view;

		// attach div to editor dom
		this.container.style.position = 'absolute';
		this.view.dom.parentNode!.appendChild(this.container);

		this.update(this.view, null);
	}

	update(view: EditorView, lastState: EditorState | null) {
		const state = view.state;

		// Don't do anything if the document/selection didn't change
		if (lastState && lastState.doc.eq(state.doc) && lastState.selection.eq(state.selection)) {
			return;
		}

		// clear all previous controls
		this.clearChildren();

		const node = ContentEditorControls.getSelectedNode(view);
		if (node !== null) {
			console.log(node.type.name);

			switch (node.type.name) {
				case 'paragraph':
					if (state.selection.empty) {
						// for a paragraph, we show the "Add new content" controls
						// aka add image, video, sound...

						// move container to the right of the line
						const start = view.coordsAtPos(state.selection.from);
						const box = this.container.offsetParent.getBoundingClientRect();
						this.container.style.top = start.top - box.top + 'px';
						this.container.style.right = '0px';

						// const test = new AppButton({});
						// test.$slots.default = ['test'] as any;
						// test.$mount();

						// add controls to container
						const btn = document.createElement('button');
						btn.className = 'button';
						const icon = document.createElement('span');
						icon.className = 'jolticon -icon jolticon-screenshot';
						btn.appendChild(icon);
						this.container.appendChild(btn);
						const btn2 = document.createElement('button');
						btn2.innerText = 'test';
						this.container.appendChild(btn2);
					}
					break;
				case 'text':
					{
						// show text controls
					}
					break;
			}
		}
	}

	private clearChildren() {
		while (this.container.firstChild !== null) {
			this.container.removeChild(this.container.firstChild);
		}
	}

	private static getSelectedNode(view: EditorView) {
		let selFrom = view.state.selection.from;
		let node = view.state.doc.nodeAt(selFrom);
		if (node === null && selFrom > 0) {
			selFrom--;
			node = view.state.doc.nodeAt(selFrom);
		}
		if (node === undefined) {
			return null;
		}
		return node;
	}

	destroy() {
		this.container.remove();
	}
}
