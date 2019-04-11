import { Mark, Node, NodeType } from 'prosemirror-model';
import { EditorState, Transaction } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { imageMimeTypes, isImage } from '../../../utils/image';
import { uuidv4 } from '../../../utils/uuid';

export class ContentEditorService {
	/**
	 * Ensures that the last node in the editor doc is a specific node.
	 */
	public static ensureEndNode(tr: Transaction, nodeType: NodeType) {
		if (tr.doc.lastChild && tr.doc.lastChild.type.name !== nodeType.name) {
			const newNode = nodeType.create();
			return tr.insert(tr.doc.nodeSize - 2, newNode);
		}
		return undefined;
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

	/**
	 * Indicates whether the given node is contained in a node of the given type.
	 * Returns the parent node that matched, or `false`.
	 */
	public static isContainedInNode(state: EditorState, node: Node, nodeType: NodeType) {
		let child = node;
		let parent = this.getParentNode(state, node);
		while (parent !== null) {
			if (parent.type.name === nodeType.name) {
				return parent;
			}

			// Walk up
			child = parent;
			parent = this.getParentNode(state, child);
		}
		return false;
	}

	public static handleImageUploads(view: EditorView, items: DataTransferItemList) {
		let handled = false;

		for (let i = 0; i < items.length; i++) {
			const transferItem = items[i];

			if (
				transferItem.kind === 'file' &&
				imageMimeTypes.includes(transferItem.type.toLowerCase())
			) {
				const result = this.handleImageFile(view, transferItem);
				if (result) {
					handled = true;
				}
			}
		}
		return handled;
	}

	public static handleImageFile(view: EditorView, data: DataTransferItem) {
		const imageFile = data.getAsFile();

		if (imageFile !== null && isImage(imageFile)) {
			const reader = new FileReader();
			reader.onloadend = () => {
				const newNode = (view.state.schema.nodes.mediaUpload as NodeType).create({
					src: reader.result,
					uploadId: uuidv4(),
				});
				const tr = view.state.tr.replaceSelectionWith(newNode);
				view.focus();
				view.dispatch(tr);
			};
			reader.readAsDataURL(imageFile);
			return true;
		}

		return false;
	}

	public static findNodePosition(state: EditorState, node: Node) {
		let i = 0;
		while (i < state.doc.nodeSize) {
			const child = state.doc.nodeAt(i);
			if (child === node) {
				return i;
			}
			i++;
		}
		throw new Error('Node not found in document');
	}

	public static getLength(state: EditorState): number {
		return this.getNodeLength(state.doc);
	}

	private static getNodeLength(node: Node): number {
		let length = 0;

		switch (node.type.name) {
			case 'text':
				if (node.text) {
					length += node.text.length;
				}
				break;
			case 'listItem': // Include a char for the 1./* at the beginning
			case 'gjEmoji':
			case 'hardBreak':
			case 'hr':
				length++;
				break;
			case 'embed':
				length += node.attrs.source.length;
				break;
			case 'mediaItem':
				length += node.attrs.caption.length + 1;
				break;
			case 'mention':
				length += node.attrs.value.length;
				break;
			case 'tag':
				length += node.attrs.text.length;
				break;
		}

		for (let i = 0; i < node.childCount; i++) {
			const child = node.child(i);
			length += this.getNodeLength(child);
		}

		return length;
	}

	public static isDisabled(view: EditorView) {
		return !!view.props.editable && !view.props.editable(view.state);
	}
}
