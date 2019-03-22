import { InputRule } from 'prosemirror-inputrules';
import { NodeType } from 'prosemirror-model';
import { EditorState } from 'prosemirror-state';
import { checkCurrentNodeIsCode } from './input-rules';

export function insertMentionRule() {
	return new InputRule(
		/(?:^|\W)@([a-z0-9_-]+)([\s!?\.,;:"'\)}\]])$/,
		(state: EditorState<any>, match: string[], start: number, end: number) => {
			if (match.length === 3) {
				// We don't want to insert mentions inside code text.
				if (checkCurrentNodeIsCode(state)) {
					return null;
				}

				const tr = state.tr;

				// Make sure only the actual mention placeholder gets replaced
				let matchWalker = 0;
				while (!match[0].substr(matchWalker).startsWith('@')) {
					matchWalker++;
				}
				start += matchWalker;

				const mentionText = match[1];
				const newNode = (state.schema.nodes.mention as NodeType).create({
					value: mentionText,
				});

				tr.replaceRangeWith(start, end, newNode);

				// We want to insert a space because it gets eaten by the input rule by default.
				tr.insertText(match[2], start + 1);

				return tr;
			}
			return null;
		}
	);
}
