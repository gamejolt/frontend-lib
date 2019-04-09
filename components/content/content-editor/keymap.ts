import { AppContentEditor } from 'game-jolt-frontend-lib/components/content/content-editor/content-editor';
import { ContentEditorService } from 'game-jolt-frontend-lib/components/content/content-editor/content-editor.service';
import { ContentListService } from 'game-jolt-frontend-lib/components/content/content-editor/content-list.service';
import { ContentEditorLinkModal } from 'game-jolt-frontend-lib/components/content/content-editor/modals/link/link-modal.service';
import { chainCommands, exitCode, toggleMark } from 'prosemirror-commands';
import { redo, undo } from 'prosemirror-history';
import { Schema } from 'prosemirror-model';
import { sinkListItem, splitListItem } from 'prosemirror-schema-list';
import { EditorState, Transaction } from 'prosemirror-state';

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
		// open emoji panel
		'Mod-e': () => {
			if (editor.capabilities.gjEmoji) {
				editor.showEmojiPanel();
			}
			return true;
		},
		// Add/remove link
		'Mod-k': async (state: EditorState, dispatch: ((tr: Transaction) => void)) => {
			const selectionMarks = ContentEditorService.getSelectionMarks(state);
			if (selectionMarks.some(m => m.type.name === 'link')) {
				toggleMark(schema.marks.link);
			} else {
				const result = await ContentEditorLinkModal.show();
				if (result) {
					toggleMark(schema.marks.link, {
						href: result.href,
						title: result.title,
					})(state, dispatch);
				}
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
