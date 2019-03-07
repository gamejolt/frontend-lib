import { checkCurrentNodeIsCode } from 'game-jolt-frontend-lib/components/content/content-editor/plugins/input-rules/input-rules';
import { InputRule } from 'prosemirror-inputrules';
import { MarkType } from 'prosemirror-model';
import { EditorState } from 'prosemirror-state';

// Preface: This input rule does not accurately detect URLs based on the actual RFCs.
// It just links http:// and then however many domain parts, and optionally a "path" (`/` and then any non-whitespace).
export function autolinkUrlRule() {
	return new InputRule(
		/(?:^|\W)https?:\/\/[a-z0-9-_]{2,}(?:\.[a-z0-9-_]{2,})+(?:\/\S*)?$/i,
		(state: EditorState<any>, match: string[], start: number, end: number) => {
			if (match.length === 1) {
				// We don't want to autolink inside code text.
				if (checkCurrentNodeIsCode(state)) {
					return null;
				}

				const tr = state.tr;
				// This inserts the char that gets swallowed by the input rule.
				tr.insertText(match[0], start, end);

				// Removes all previous links on this text
				tr.removeMark(start, end, state.schema.marks.link);

				const href = match[0];
				const linkMark = (state.schema.marks.link as MarkType).create({
					href,
					title: href,
				});
				// Add the link mark to the text. +1 to include the new char.
				tr.addMark(start, end + 1, linkMark);

				return tr;
			}

			return null;
		}
	);
}
