import { Node } from 'prosemirror-model';
import { EditorState, Transaction } from 'prosemirror-state';
import { PMDispatch } from './keymap';

/**
 * Removes mentions/tags and replaces them with plain text when removing from their end.
 */
export function onBackspace() {
	return function(state: EditorState, dispatch: PMDispatch | undefined) {
		if (!dispatch) {
			return false;
		}

		const slice = state.doc.slice(0, state.selection.to);
		const lastChild = slice.content.lastChild;

		if (lastChild instanceof Node && lastChild.type.name === 'paragraph') {
			const child = lastChild.lastChild;

			if (child instanceof Node) {
				const tr = state.tr;

				switch (child.type.name) {
					case 'mention':
						replaceMention(state, tr, child);
						dispatch(tr);
						return true;
					case 'tag':
						replaceTag(state, tr, child);
						dispatch(tr);
						return true;
				}
			}
		}
		return false;
	};
}

function replaceMention(state: EditorState, tr: Transaction, child: Node) {
	let mentionText = child.attrs.value as string;
	mentionText = mentionText.substr(0, mentionText.length - 1);
	const textNode = state.schema.text('@' + mentionText);
	tr.replaceWith(state.selection.to - 1, state.selection.to, textNode);
}

function replaceTag(state: EditorState, tr: Transaction, child: Node) {
	let tagText = child.attrs.text as string;
	tagText = tagText.substr(0, tagText.length - 1);
	const textNode = state.schema.text('#' + tagText);
	tr.replaceWith(state.selection.to - 1, state.selection.to, textNode);
}
