import { AppContentEditor } from 'game-jolt-frontend-lib/components/content/content-editor/content-editor';
import { getContentEditorKeymap } from 'game-jolt-frontend-lib/components/content/content-editor/keymap';
import { createInputRules } from 'game-jolt-frontend-lib/components/content/content-editor/plugins/input-rules/input-rules';
import { UpdateIncrementerPlugin } from 'game-jolt-frontend-lib/components/content/content-editor/plugins/update-incrementer-plugin';
import { baseKeymap } from 'prosemirror-commands';
import { history } from 'prosemirror-history';
import { keymap } from 'prosemirror-keymap';
import { Schema } from 'prosemirror-model';
import { Plugin } from 'prosemirror-state';

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
