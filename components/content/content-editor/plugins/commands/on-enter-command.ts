import { NodeType } from 'prosemirror-model';
import { EditorState, Transaction } from 'prosemirror-state';
import { ContextCapabilities } from '../../../content-context';
import { ContentEditorService } from '../../content-editor.service';
import { checkCurrentNodeIsCode } from '../plugins';
import { PMDispatch } from './keymap';

/**
 * This command executes our common "on enter" functionality:
 *  - Insert a mention
 *  - Insert a tag
 */
export function onEnter(capabilities: ContextCapabilities) {
	return function(state: EditorState, dispatch: PMDispatch | undefined) {
		const slice = state.doc.slice(0, state.selection.to);
		const text = ContentEditorService.getFragmentText(slice.content);

		if (dispatch && state.selection.empty && !checkCurrentNodeIsCode(state)) {
			const tr = state.tr;

			if (capabilities.mention && !tr.docChanged) {
				replaceMentionText(state, tr, text);
			}
			if (capabilities.tag && !tr.docChanged) {
				replaceTagText(state, tr, text);
			}

			if (tr.docChanged) {
				dispatch(tr);
			}
		}

		// Always return false, we want the editor to still execute all other commands.
		return false;
	};
}

function replaceMentionText(state: EditorState, tr: Transaction, text: string) {
	const mentionMatch = text.match(/(?:^|\W)@([a-z0-9_-]+)$/i);
	if (mentionMatch !== null && mentionMatch.length > 1) {
		const mentionText = mentionMatch[1];
		const newNode = (state.schema.nodes.mention as NodeType).create({
			value: mentionText,
		});

		const to = state.selection.to;
		const from = state.selection.to - 1 - mentionText.length;
		tr.replaceRangeWith(from, to, newNode).scrollIntoView();
	}
}

function replaceTagText(state: EditorState, tr: Transaction, text: string) {
	const tagMatch = text.match(/(?:^|\W)#([a-z0-9_-]+)$/i);
	if (tagMatch !== null && tagMatch.length > 1) {
		const tagText = tagMatch[1];
		const newNode = (state.schema.nodes.tag as NodeType).create({
			text: tagText,
		});

		const to = state.selection.to;
		const from = state.selection.to - 1 - tagText.length;
		tr.replaceRangeWith(from, to, newNode).scrollIntoView();
	}
}
