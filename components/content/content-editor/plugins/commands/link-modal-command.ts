import { toggleMark } from 'prosemirror-commands';
import { Schema } from 'prosemirror-model';
import { EditorState } from 'prosemirror-state';
import { ContentEditorService } from '../../content-editor.service';
import { ContentEditorLinkModal } from '../../modals/link/link-modal.service';
import { checkCurrentNodeIsCode } from '../plugins';
import { PMDispatch } from './keymap';

export function showLinkModal(schema: Schema) {
	return async function(state: EditorState, dispatch: PMDispatch | undefined) {
		if (checkCurrentNodeIsCode(state)) {
			return false;
		}

		const selectionMarks = ContentEditorService.getSelectionMarks(state);
		if (selectionMarks.some(m => m.type.name === 'link')) {
			toggleMark(schema.marks.link);
		} else {
			const selectedText = ContentEditorService.getSelectedText(state);
			const result = await ContentEditorLinkModal.show(selectedText);
			if (result) {
				toggleMark(schema.marks.link, {
					href: result.href,
					title: result.title,
				})(state, dispatch);
			}
		}
		return true;
	};
}
