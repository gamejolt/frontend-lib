import { InputRule } from 'prosemirror-inputrules';
import { MarkType } from 'prosemirror-model';
import { EditorState } from 'prosemirror-state';

export function autolinkCommunityRule() {
	return new InputRule(
		/(?:^|\W)c\/([a-z0-9-_]{3,50})$/i,
		(state: EditorState<any>, match: string[], start: number, end: number) => {
			if (match.length === 2) {
				const tr = state.tr;
				// This inserts the char that gets swallowed by the input rule.
				tr.insertText(match[0], start, end);
				// Removes all previous links on this text
				tr.removeMark(start, end, state.schema.marks.link);
				const linkMark = (state.schema.marks.link as MarkType).create({
					href: '/c/' + match[1],
					title: 'Community: ' + match[1],
				});
				// Add the link mark to the text. +1 to include the new char.
				tr.addMark(start, end + 1, linkMark);

				return tr;
			}

			return null;
		}
	);
}
