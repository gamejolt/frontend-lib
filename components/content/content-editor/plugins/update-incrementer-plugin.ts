import { AppContentEditor } from 'game-jolt-frontend-lib/components/content/content-editor/content-editor';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

export class UpdateIncrementerPlugin {
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
		this.appEditor.stateCounter++;
	}
}
