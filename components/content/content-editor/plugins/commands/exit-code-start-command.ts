import { Node, NodeType } from 'prosemirror-model';
import { EditorState, Selection } from 'prosemirror-state';
import { ContextCapabilities } from '../../../content-context';
import { ContentEditorService } from '../../content-editor.service';
import { PMDispatch } from './keymap';

export function exitCodeStart(capabilities: ContextCapabilities) {
	return function(state: EditorState, dispatch: PMDispatch | undefined) {
		if (!dispatch || !state.selection.empty || !capabilities.codeBlock) {
			return false;
		}

		const selectedNode = ContentEditorService.getSelectedNode(state);
		if (selectedNode === null) {
			return false;
		}

		const codeBlock = ContentEditorService.isContainedInNode(
			state,
			selectedNode,
			state.schema.nodes.codeBlock
		);

		if (codeBlock instanceof Node) {
			const codeBlockPos = ContentEditorService.findNodePosition(state, codeBlock);

			// Are we at the beginning of our code block?
			if (codeBlockPos === state.selection.from - 1) {
				const tr = state.tr;

				// Create paragraph node and insert
				const newNode = (state.schema.nodes.paragraph as NodeType).create();
				tr.insert(codeBlockPos, newNode);

				// Resolve its position and set the selection.
				const resolvedPos = tr.doc.resolve(state.selection.from - 1);
				const selection = Selection.findFrom(resolvedPos, 1);
				if (selection instanceof Selection) {
					tr.setSelection(selection).scrollIntoView();
				}

				dispatch(tr);
				return true;
			}
		}

		return false;
	};
}