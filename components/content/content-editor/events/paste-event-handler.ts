import { EditorView } from 'prosemirror-view';
import { ContentEditorService } from '../content-editor.service';

// Handles pasting direct image data from e.g. Paint, GIMP or web browsers

export function pasteEventHandler(view: EditorView, e: Event) {
	if (!ContentEditorService.isDisabled(view) && e.type === 'paste') {
		const pasteEvent = e as ClipboardEvent;
		if (!!pasteEvent.clipboardData && !!pasteEvent.clipboardData.items) {
			return ContentEditorService.handleImageUploads(view, pasteEvent.clipboardData.items);
		}
	}
	return false;
}
