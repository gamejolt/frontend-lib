import { InputRule } from 'prosemirror-inputrules';
import { NodeType } from 'prosemirror-model';
import { EditorState } from 'prosemirror-state';
import { checkCurrentNodeIsCode } from './input-rules';

export function insertOrderedListRule() {
	return new InputRule(
		/^1. $/,
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
			const listNode = (state.schema.nodes.orderedList as NodeType).create({}, [
				listItemNode,
			]);

			tr.replaceRangeWith(start, end, listNode);

			return tr;
		}
	);
}
