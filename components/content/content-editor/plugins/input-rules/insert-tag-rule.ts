import { InputRule } from 'prosemirror-inputrules';
import { NodeType } from 'prosemirror-model';
import { EditorState } from 'prosemirror-state';

export function insertTagRule() {
	return new InputRule(
		/#([a-z0-9]+)\s$/i,
		(state: EditorState<any>, match: string[], start: number, end: number) => {
			if (match.length === 2) {
				const tr = state.tr;
				const tagText = match[1];

				const newNode = (state.schema.nodes.tag as NodeType).create({ text: tagText });
				tr.replaceRangeWith(start, end, newNode);
				// We want to insert a space because it gets eaten by the input rule by default.
				tr.insertText(' ', start + 1, start + 1);

				return tr;
			}
			return null;
		}
	);
}
