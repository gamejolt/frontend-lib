import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import AppContentEditor from '../content-editor';
import { ContentEditorService } from '../content-editor.service';

export class ShowEmojiPanelPlugin {
	view: EditorView;
	appEditor: AppContentEditor;

	constructor(view: EditorView, appEditor: AppContentEditor) {
		this.view = view;
		this.appEditor = appEditor;
	}

	update(view: EditorView, lastState: EditorState | null) {
		const state = view.state;
		if (lastState && lastState.doc.eq(state.doc) && lastState.selection.eq(state.selection)) {
			return;
		}

		const selectedNode = ContentEditorService.getSelectedNode(view.state);
		if (selectedNode && lastState && !lastState.doc.eq(state.doc)) {
			console.log('type', selectedNode.type.name);
			if (selectedNode.type.name === 'text') {
				console.log('text', selectedNode.text);
				const selection = view.state.selection;
				console.log('selection', selection.from);
				const cutText = view.state.doc.cut(selection.from - 4, selection.from).textContent;
				console.log('actual', cutText);
				if (
					(cutText.length === 4 && cutText.startsWith(' :')) ||
					(cutText.length === 3 && cutText[0] === ':')
				) {
					console.log('prompt emoji');
					this.appEditor.emojiPanelVisible = true;
				}
			}
		}
	}
}
