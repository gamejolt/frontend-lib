import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import AppContentEditor from '../content-editor';

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
		// If anything in the editor changes (content or selection), make sure we increment, so we can for example reposition controls.
		this.appEditor.stateCounter++;
		if (!lastState || !lastState.doc.eq(state.doc)) {
			this.appEditor.onUpdate(state);
		}
	}
}
