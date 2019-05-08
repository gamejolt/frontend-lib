import { InputRule } from 'prosemirror-inputrules';
import { NodeType } from 'prosemirror-model';
import { EditorState, Selection } from 'prosemirror-state';
import { checkCurrentNodeIsCode } from '../plugins';

export function insertBulletListRule() {
	return new InputRule(
		/^(?:\*|-) $/,
		(state: EditorState<any>, _match: string[], start: number, end: number) => {
			// We don't want to insert lists inside code text.
			if (checkCurrentNodeIsCode(state)) {
				return null;
			}

			const tr = state.tr;

			const contentParagraph = (state.schema.nodes.paragraph as NodeType).create();
			const listItemNode = (state.schema.nodes.listItem as NodeType).create({}, [
				contentParagraph,
			]);
			const listNode = (state.schema.nodes.bulletList as NodeType).create({}, [listItemNode]);

			tr.replaceRangeWith(start, end, listNode);
			const resolvedCursorPos = tr.doc.resolve(state.selection.from);
			const selection = Selection.near(resolvedCursorPos);
			tr.setSelection(selection);

			return tr;
		}
	);
}
