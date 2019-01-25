import { ContentEditorService } from 'game-jolt-frontend-lib/components/content/content-editor/content-editor.service';
import { uuidv4 } from 'game-jolt-frontend-lib/utils/uuid';
import { NodeType } from 'prosemirror-model';
import { EditorView } from 'prosemirror-view';
import { imageMimeTypes, isImage } from '../../../../utils/image';

// Handles pasting direct image data from e.g. Paint, GIMP or web browsers

export function pasteEventHandler(view: EditorView, e: Event) {
	if (e.type === 'paste') {
		const pasteEvent = e as ClipboardEvent;

		// Go through the pasted items and try and upload the first matching image file blob.
		if (!!pasteEvent.clipboardData && !!pasteEvent.clipboardData.items) {
			for (let i = 0; i < pasteEvent.clipboardData.items.length; i++) {
				const transferItem = pasteEvent.clipboardData.items[i];

				if (
					transferItem.kind === 'file' &&
					imageMimeTypes.includes(transferItem.type.toLowerCase())
				) {
					return handlePastedImageBlob(view, transferItem);
				}
			}
		}
	}
	return false;
}

function handlePastedImageBlob(view: EditorView, data: DataTransferItem) {
	const imageFile = data.getAsFile();

	if (imageFile !== null && isImage(imageFile)) {
		const reader = new FileReader();
		reader.onloadend = () => {
			const newNode = (view.state.schema.nodes.mediaUpload as NodeType).create({
				src: reader.result,
				uploadId: uuidv4(),
			});
			ContentEditorService.insertNode(view, newNode);
		};
		reader.readAsDataURL(imageFile);
		return true;
	}

	return false;
}
