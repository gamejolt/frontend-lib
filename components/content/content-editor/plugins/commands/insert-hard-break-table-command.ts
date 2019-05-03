import { EditorState } from 'prosemirror-state';
import { ContentEditorService } from '../../content-editor.service';
import { PMDispatch } from './keymap';

/**
 * Command that insert a break inside a table cell instead of splitting the node.
 * Meant to be used on enter.
 */
export function insertHardBreakTable() {
	return function(state: EditorState, dispatch: PMDispatch | undefined) {
		if (!dispatch) {
			return false;
		}

		const selectedNode = ContentEditorService.getSelectedNode(state);
		if (selectedNode === null) {
			return false;
		}

		const tableNode = ContentEditorService.isContainedInNode(
			state,
			selectedNode,
			state.schema.nodes.table
		);
		if (tableNode === null) {
			return false;
		}

		dispatch(
			state.tr.replaceSelectionWith(state.schema.nodes.hardBreak.create()).scrollIntoView()
		);
		return true;
	};
}
