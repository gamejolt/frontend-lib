import { InputRule } from 'prosemirror-inputrules';
import { NodeType } from 'prosemirror-model';
import { EditorState } from 'prosemirror-state';
import { GJ_EMOJIS } from '../../schemas/specs/nodes/gj-emoji-nodespec';

export function insertEmojiRule() {
	const emojiRegex = GJ_EMOJIS.join('|');
	const regex = new RegExp(`:(${emojiRegex}):$`, 'i');

	return new InputRule(
		regex,
		(state: EditorState<any>, match: string[], start: number, end: number) => {
			if (match.length === 2) {
				const tr = state.tr;
				const emojiType = match[1];

				const newNode = (state.schema.nodes.gjEmoji as NodeType).create({
					type: emojiType.toLowerCase(),
				});
				tr.replaceRangeWith(start, end, newNode);

				return tr;
			}
			return null;
		}
	);
}
