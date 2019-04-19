import { InputRule } from 'prosemirror-inputrules';
import { NodeType } from 'prosemirror-model';
import { EditorState } from 'prosemirror-state';
import { GJ_EMOJIS } from '../../schemas/specs/nodes/gj-emoji-nodespec';
import { checkCurrentNodeIsCode } from './input-rules';

export function insertEmojiRule() {
	const emojiRegex = GJ_EMOJIS.join('|');
	const regex = new RegExp(`(?:^|\\W):(${emojiRegex}):$`, 'i');

	return new InputRule(
		regex,
		(state: EditorState<any>, match: string[], start: number, end: number) => {
			if (match.length === 2) {
				// We don't want to insert emojis inside code text.
				if (checkCurrentNodeIsCode(state)) {
					return null;
				}

				const tr = state.tr;
				const emojiType = match[1];

				// Make sure only the actual emoji placeholder gets replaced
				let matchWalker = 0;
				while (!match[0].substr(matchWalker).startsWith(':')) {
					matchWalker++;
				}
				start += matchWalker;

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