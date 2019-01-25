import { ContentEditorService } from 'game-jolt-frontend-lib/components/content/content-editor/content-editor.service';
import { EditorView } from 'prosemirror-view';

// Handles dropping image files into the content editor

export function dropEventHandler(view: EditorView, e: Event) {
	if (e.type === 'drop') {
		const dropEvent = e as DragEvent;
		if (!!dropEvent.dataTransfer && dropEvent.dataTransfer.items) {
			return ContentEditorService.handleImageUploads(view, dropEvent.dataTransfer.items);
		}
	}
	return false;
}
