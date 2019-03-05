import { InputRule, inputRules } from 'prosemirror-inputrules';
import { ContextCapabilities } from '../../../content-context';
import { insertEmojiRule } from './insert-emoji-rule';
import { insertTagRule } from './insert-tag-rule';

export function createInputRules(capabilities: ContextCapabilities) {
	const rules = [] as InputRule[];

	if (capabilities.tag) {
		rules.push(insertTagRule());
	}
	if (capabilities.gjEmoji) {
		rules.push(insertEmojiRule());
	}

	return inputRules({ rules });
}
