import { AppContentEditor } from 'game-jolt-frontend-lib/components/content/content-editor/content-editor';

// Event handlers to show/hide the editor controls on focus/blur of the content div

export function focusEventHandler(editor: AppContentEditor) {
	editor.controlsVisible = true;
	return false;
}

export function blurEventHandler(editor: AppContentEditor) {
	editor.controlsVisible = false;
	return false;
}
