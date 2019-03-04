import { InputRule, inputRules } from 'prosemirror-inputrules';
import { ContextCapabilities } from '../../../content-context';
import { insertTagRule } from './insert-tag-rule';

export function createInputRules(capabilities: ContextCapabilities) {
	const rules = [] as InputRule[];

	if (capabilities.tag) {
		rules.push(insertTagRule());
	}

	return inputRules({ rules });
}
