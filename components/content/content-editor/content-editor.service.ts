import { EditorState } from 'prosemirror-state';

export class ContentEditorService {
	public static getSelectedNode(state: EditorState) {
		let selFrom = state.selection.from;
		let node = state.doc.nodeAt(selFrom);
		if (node === null && selFrom > 0) {
			selFrom--;
			node = state.doc.nodeAt(selFrom);
		}
		if (node === undefined) {
			return null;
		}
		return node;
	}
}
