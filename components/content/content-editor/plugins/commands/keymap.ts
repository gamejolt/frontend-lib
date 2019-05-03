import { onBackspace } from 'game-jolt-frontend-lib/components/content/content-editor/plugins/commands/on-backspace-command';
import { chainCommands, exitCode, toggleMark } from 'prosemirror-commands';
import { redo, undo } from 'prosemirror-history';
import { Schema } from 'prosemirror-model';
import { sinkListItem, splitListItem } from 'prosemirror-schema-list';
import { EditorState, Transaction } from 'prosemirror-state';
import AppContentEditor from '../../content-editor';
import { ContentListService } from '../../content-list.service';
import { exitCodeStart } from './exit-code-start-command';
import { insertHardBreak } from './insert-hard-break-command';
import { showLinkModal } from './link-modal-command';
import { onEnter } from './on-enter-command';
import { splitHeading } from './split-heading-command';

export type PMDispatch = (tr: Transaction) => void;
export type PMKeymapCommand = (state: EditorState, tr: PMDispatch | undefined) => boolean;

export function getContentEditorKeymap(editor: AppContentEditor, schema: Schema) {
	const isMac = typeof navigator != 'undefined' ? /Mac/.test(navigator.platform) : false;

	const keymap = {
		'Mod-z': undo,
		'Shift-Mod-z': redo,
		'Mod-b': toggleMark(schema.marks.strong),
		'Mod-i': toggleMark(schema.marks.em),
		'Mod-`': toggleMark(schema.marks.code),
		'Shift-Enter': chainCommands(
			exitCodeStart(editor.capabilities),
			exitCode,
			onEnter(editor.capabilities),
			insertHardBreak
		),
		// open emoji panel
		'Mod-e': () => {
			if (editor.capabilities.gjEmoji) {
				editor.showEmojiPanel();
			}
			return true;
		},
		// Add/remove link
		'Mod-k': showLinkModal(schema),
		Backspace: onBackspace(),
	} as { [k: string]: any };

	const enterCommands = [] as PMKeymapCommand[];
	enterCommands.push(onEnter(editor.capabilities));

	if (editor.capabilities.heading) {
		enterCommands.push(splitHeading());
	}

	if (editor.capabilities.lists) {
		enterCommands.push(splitListItem(schema.nodes.listItem));
		keymap['Shift-Tab'] = ContentListService.liftListItem(schema.nodes.listItem);
		keymap['Tab'] = sinkListItem(schema.nodes.listItem);
	}

	keymap['Enter'] = chainCommands(...enterCommands);

	if (!isMac) {
		keymap['Mod-y'] = redo;
	}

	return keymap;
}
