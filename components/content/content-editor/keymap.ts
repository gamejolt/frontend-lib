import { chainCommands, exitCode, toggleMark } from 'prosemirror-commands';
import { redo, undo } from 'prosemirror-history';
import { Schema } from 'prosemirror-model';

export function getContentEditorKeymap(schema: Schema) {
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
	} as { [k: string]: any };

	if (!isMac) {
		keymap['Mod-y'] = redo;
	}

	return keymap;
}
