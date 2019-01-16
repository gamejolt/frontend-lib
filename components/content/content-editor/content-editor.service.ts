import { Node } from 'prosemirror-model';
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

	private static findParentNode(proposedParent: Node, child: Node): Node | null {
		for (let i = 0; i < proposedParent.childCount; i++) {
			const parentChild = proposedParent.child(i);
			if (parentChild === child) {
				return proposedParent;
			} else {
				const maybeParent = this.findParentNode(parentChild, child);
				if (maybeParent !== null) {
					return maybeParent;
				}
			}
		}

		return null;
	}

	public static getParentNode(state: EditorState, child: Node) {
		return this.findParentNode(state.doc, child);
	}
}
