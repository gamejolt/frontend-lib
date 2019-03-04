import { InputRule } from 'prosemirror-inputrules';
import { NodeType } from 'prosemirror-model';
import { EditorState } from 'prosemirror-state';

export function insertTagRule() {
	return new InputRule(
		/(?:^|\s)#[a-z0-9]+\s$/i,
		(state: EditorState<any>, match: string[], start: number, end: number) => {
			const tr = state.tr;

			if (match.length > 0 && match[0].trim().length > 0) {
				let tagText = match[0];
				while (!tagText.startsWith(' ') && !tagText.startsWith('#')) {
					tagText = tagText.substr(1);
					start++;
				}
				if (tagText.startsWith(' ') || tagText.startsWith('#')) {
					let insertSpace = false;

					// If there's a space preceding the tag, do not include it
					if (tagText.startsWith(' ')) {
						tagText = tagText.trimLeft();
						start++;
					}

					// The tag probably was created by entering a space, do not include it
					if (tagText.endsWith(' ')) {
						tagText = tagText.trimRight();
						insertSpace = true;
					}

					// Remove the '#'
					tagText = tagText.substr(1);

					const newNode = (state.schema.nodes.tag as NodeType).create({ text: tagText });
					tr.replaceRangeWith(start, end, newNode);

					// The space inserted by the user gets lost by default, so we insert it after the tag element
					if (insertSpace) {
						tr.insertText(' ', start + 1, start + 1);
					}
				}
			}
			return tr;
		}
	);
}
