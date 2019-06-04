import { InputRule, inputRules } from 'prosemirror-inputrules';
import { ContextCapabilities } from '../../../content-context';
// import { autolinkCommunityRule } from './autolink-community-rule';
import { insertBulletListRule } from './insert-bullet-list-rule';
import { insertEmojiRule } from './insert-emoji-rule';
import { insertOrderedListRule } from './insert-ordered-list-rule';

export function createInputRules(capabilities: ContextCapabilities) {
	const rules = [] as InputRule[];

	if (capabilities.emoji) {
		rules.push(insertEmojiRule());
	}
	if (capabilities.textLink) {
		// rules.push(autolinkCommunityRule());
	}
	if (capabilities.list) {
		rules.push(insertOrderedListRule());
		rules.push(insertBulletListRule());
	}

	return inputRules({ rules });
}
