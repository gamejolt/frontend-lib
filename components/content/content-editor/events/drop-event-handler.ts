import { EditorView } from 'prosemirror-view';
import { ContentEditorService } from '../content-editor.service';

// Handles dropping image files into the content editor

export function dropEventHandler(view: EditorView, e: Event) {
	if (!ContentEditorService.isDisabled(view) && e.type === 'drop') {
		const dropEvent = e as DragEvent;
		if (!!dropEvent.dataTransfer && dropEvent.dataTransfer.items) {
			return ContentEditorService.handleImageUploads(view, dropEvent.dataTransfer.items);
		}
	}
	return false;
}
