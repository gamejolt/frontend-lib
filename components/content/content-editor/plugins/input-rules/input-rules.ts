import { ContentEditorService } from 'game-jolt-frontend-lib/components/content/content-editor/content-editor.service';
import { autolinkCommunityRule } from 'game-jolt-frontend-lib/components/content/content-editor/plugins/input-rules/autolink-community-rule';
import { autolinkUrlRule } from 'game-jolt-frontend-lib/components/content/content-editor/plugins/input-rules/autolink-url-rule';
import { insertBulletListRule } from 'game-jolt-frontend-lib/components/content/content-editor/plugins/input-rules/insert-bullet-list-rule';
import { insertMentionRule } from 'game-jolt-frontend-lib/components/content/content-editor/plugins/input-rules/insert-mention-rule';
import { insertOrderedListRule } from 'game-jolt-frontend-lib/components/content/content-editor/plugins/input-rules/insert-ordered-list-rule';
import { InputRule, inputRules } from 'prosemirror-inputrules';
import { Node } from 'prosemirror-model';
import { EditorState } from 'prosemirror-state';
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
	if (capabilities.mention) {
		rules.push(insertMentionRule());
	}
	if (capabilities.textLink) {
		rules.push(autolinkCommunityRule());
		rules.push(autolinkUrlRule());
	}
	if (capabilities.lists) {
		rules.push(insertOrderedListRule());
		rules.push(insertBulletListRule());
	}

	return inputRules({ rules });
}

export function checkCurrentNodeIsCode(state: EditorState) {
	const node = ContentEditorService.getSelectedNode(state);
	if (node instanceof Node && node.type.name === 'text') {
		if (node.marks.some(m => m.type.name === 'code')) {
			return true;
		} else {
			const parent = ContentEditorService.getParentNode(state, node);
			if (parent instanceof Node && parent.type.name === 'codeBlock') {
				return true;
			}
		}
	}
	return false;
}
