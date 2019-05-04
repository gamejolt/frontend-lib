import { InputRule } from 'prosemirror-inputrules';
import { NodeType } from 'prosemirror-model';
import { EditorState } from 'prosemirror-state';
import { checkCurrentNodeIsCode } from '../plugins';

export function insertTagRule() {
	return new InputRule(
		/(?:^|\W)#([a-z0-9_-]+)([\s!?\.,;:"'\)}\]])$/i,
		(state: EditorState<any>, match: string[], start: number, end: number) => {
			if (match.length === 3) {
				// We don't want to insert tags inside code text.
				if (checkCurrentNodeIsCode(state)) {
					return null;
				}

				const tr = state.tr;

				// Make sure only the actual tag placeholder gets replaced
				let matchWalker = 0;
				while (!match[0].substr(matchWalker).startsWith('#')) {
					matchWalker++;
				}
				start += matchWalker;

				const tagText = match[1];
				const newNode = (state.schema.nodes.tag as NodeType).create({ text: tagText });
				tr.replaceRangeWith(start, end, newNode);

				// We want to insert a space because it gets eaten by the input rule by default.
				tr.insertText(match[2], start + 1);

				return tr;
			}
			return null;
		}
	);
}
