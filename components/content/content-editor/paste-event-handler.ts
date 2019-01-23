import { ContentEditorService } from 'game-jolt-frontend-lib/components/content/content-editor/content-editor.service';
import { NodeType } from 'prosemirror-model';
import { EditorView } from 'prosemirror-view';

const AcceptedImageMimeTypes = ['image/png', 'image/jpg', 'image/jpeg'];

// Handles pasting direct image data from e.g. Paint, GIMP, etc
// The MediaUpload nodespec handles pasting images from the web

export function pasteEventHandler(view: EditorView, e: Event) {
	if (e.type === 'paste') {
		const pasteEvent = e as ClipboardEvent;
		// Make sure the pasted data is a png/jpg file blob
		if (
			!!pasteEvent.clipboardData &&
			!!pasteEvent.clipboardData.items &&
			pasteEvent.clipboardData.items.length === 1 &&
			pasteEvent.clipboardData.items[0].kind === 'file' &&
			AcceptedImageMimeTypes.includes(pasteEvent.clipboardData.items[0].type.toLowerCase())
		) {
			return handlePastedImageBlob(view, pasteEvent.clipboardData.items[0]);
		}
	}
	return false;
}

function handlePastedImageBlob(view: EditorView, data: DataTransferItem) {
	const imageFile = data.getAsFile();

	if (imageFile !== null) {
		const reader = new FileReader();
		reader.onloadend = () => {
			const newNode = (view.state.schema.nodes.mediaUpload as NodeType).create({
				src: reader.result,
			});
			ContentEditorService.insertNode(view, newNode);
		};
		reader.readAsDataURL(imageFile);
		return true;
	}

	return false;
}
