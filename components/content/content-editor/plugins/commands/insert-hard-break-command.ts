import { EditorState } from 'prosemirror-state';
import { PMDispatch } from './keymap';

export function insertHardBreak(state: EditorState, dispatch: PMDispatch) {
	if (!dispatch) {
		return false;
	}

	dispatch(state.tr.replaceSelectionWith(state.schema.nodes.hardBreak.create()).scrollIntoView());
	return true;
}
