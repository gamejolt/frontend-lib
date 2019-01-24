import { Mark, Node } from 'prosemirror-model';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

export class ContentEditorService {
	public static insertNode(view: EditorView, newNode: Node) {
		const tr = view.state.tr;
		const selection = view.state.selection;
		const from = selection.from;

		tr.insert(from - 1, newNode);

		view.focus();
		view.dispatch(tr);
	}

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

	/**
	 * Returns a list of all applied to any node within the selection
	 */
	public static getSelectionMarks(state: EditorState) {
		const markTypes: Mark[] = [];
		state.doc.nodesBetween(
			state.selection.from,
			state.selection.to,
			(node: Node, _0: number, _1: Node, _2: number) => {
				for (const mark of node.marks) {
					if (!markTypes.some(m => m.type.name === mark.type.name)) {
						markTypes.push(mark);
					}
				}
			}
		);
		return markTypes;
	}
}
