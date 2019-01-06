import { EditorView } from 'prosemirror-view';

export class ContentEditorService {
	public static getSelectedNode(view: EditorView) {
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
}
