import { ContentEditorService } from 'game-jolt-frontend-lib/components/content/content-editor/content-editor.service';
import { EditorView } from 'prosemirror-view';

// Handles pasting direct image data from e.g. Paint, GIMP or web browsers

export function pasteEventHandler(view: EditorView, e: Event) {
	if (e.type === 'paste') {
		const pasteEvent = e as ClipboardEvent;
		if (!!pasteEvent.clipboardData && !!pasteEvent.clipboardData.items) {
			return ContentEditorService.handleImageUploads(view, pasteEvent.clipboardData.items);
		}
	}
	return false;
}
