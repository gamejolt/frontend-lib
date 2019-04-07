import { AppContentEditor } from 'game-jolt-frontend-lib/components/content/content-editor/content-editor';
import { ContentListService } from 'game-jolt-frontend-lib/components/content/content-editor/content-list.service';
import { chainCommands, exitCode, toggleMark } from 'prosemirror-commands';
import { redo, undo } from 'prosemirror-history';
import { Schema } from 'prosemirror-model';
import { sinkListItem, splitListItem } from 'prosemirror-schema-list';

export function getContentEditorKeymap(editor: AppContentEditor, schema: Schema) {
	const isMac = typeof navigator != 'undefined' ? /Mac/.test(navigator.platform) : false;

	const keymap = {
		'Mod-z': undo,
		'Shift-Mod-z': redo,
		'Mod-b': toggleMark(schema.marks.strong),
		'Mod-i': toggleMark(schema.marks.em),
		'Mod-`': toggleMark(schema.marks.code),
		'Shift-Enter': chainCommands(exitCode, (state, dispatch) => {
			dispatch!(
				state.tr
					.replaceSelectionWith(state.schema.nodes.hardBreak.create())
					.scrollIntoView()
			);
			return true;
		}),
		'Mod-e': () => {
			if (editor.capabilities.gjEmoji) {
				// Show emoji panel
				editor.emojiPanelVisible = true;
			}
			return true;
		},
	} as { [k: string]: any };

	if (editor.capabilities.lists) {
		keymap['Enter'] = splitListItem(schema.nodes.listItem);
		keymap['Shift-Tab'] = ContentListService.liftListItem(schema.nodes.listItem);
		keymap['Tab'] = sinkListItem(schema.nodes.listItem);
	}

	if (!isMac) {
		keymap['Mod-y'] = redo;
	}

	return keymap;
}
