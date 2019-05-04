import { baseKeymap } from 'prosemirror-commands';
import { history } from 'prosemirror-history';
import { keymap } from 'prosemirror-keymap';
import { Node, Schema } from 'prosemirror-model';
import { EditorState, Plugin } from 'prosemirror-state';
import AppContentEditor from '../content-editor';
import { ContentEditorService } from '../content-editor.service';
import { getContentEditorKeymap } from './commands/keymap';
import { createInputRules } from './input-rules/input-rules';
import { UpdateIncrementerPlugin } from './update-incrementer-plugin';

export function createPlugins(editor: AppContentEditor, schema: Schema): Plugin[] {
	// This is used to update any children with the new view.
	// We don't want to watch the view/state objects because they are too heavy.
	// So instead, this increments a counter every time the state changes
	const incrementerPlugin = new Plugin({
		view(editorView) {
			return new UpdateIncrementerPlugin(editorView, editor);
		},
	});

	// const emojiPanelPlugin = new Plugin({
	// 	view(editorView) {
	// 		return new ShowEmojiPanelPlugin(editorView, that);
	// 	},
	// });

	// Additional keyboard bindings
	const ourKeymap = getContentEditorKeymap(editor, schema);

	return [
		keymap(ourKeymap),
		keymap(baseKeymap),
		history(),
		incrementerPlugin,
		createInputRules(editor.capabilities),
	];
}

export function checkCurrentNodeIsCode(state: EditorState) {
	const node = ContentEditorService.getSelectedNode(state);
	if (node instanceof Node && node.type.name === 'text') {
		if (node.marks.some(m => m.type.name === 'code')) {
			return true;
		} else {
			const parent = ContentEditorService.getParentNode(state, node);
			if (parent instanceof Node && parent.type.name === 'codeBlock') {
				return true;
			}
		}
	}
	return false;
}
