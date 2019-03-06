import { ContentEditorService } from 'game-jolt-frontend-lib/components/content/content-editor/content-editor.service';
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

	return inputRules({ rules });
}

export function checkCurrentNodeIsCode(state: EditorState) {
	const node = ContentEditorService.getSelectedNode(state);
	if (node instanceof Node) {
		if (node.type.name === 'text') {
			if (node.marks.some(m => m.type.name === 'code')) {
				return true;
			} else {
				const parent = ContentEditorService.getParentNode(state, node);
				if (parent instanceof Node && parent.type.name === 'codeBlock') {
					return true;
				}
			}
		}
	}
	return false;
}
