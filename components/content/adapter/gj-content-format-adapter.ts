import {
	GJContentFormat,
	ProsemirrorEditorFormat,
} from 'game-jolt-frontend-lib/components/content/adapter/definitions';
import { arrayRemove } from 'game-jolt-frontend-lib/utils/array';
import { ContentContext, ContextCapabilities } from '../content-context';
import { GJContentObject } from './definitions';

const GJ_FORMAT_VERSION = '1.0.0';

/**
 * Adapts the GJ Content Format to the format the prosemirror content editor needs
 */
export class GJContentFormatAdapter {
	/**
	 * Converts from the GJ Content Format to the editor format
	 */
	public static adaptIn(inObj: GJContentFormat) {
		const outObj = {
			type: 'doc',
			content: inObj.content,
		} as ProsemirrorEditorFormat;

		return outObj;
	}

	/**
	 * Converts from the editor format to the GJ Content format
	 */
	public static adaptOut(inObj: ProsemirrorEditorFormat, context: ContentContext) {
		let outObj = {
			version: GJ_FORMAT_VERSION,
			createdOn: Date.now(),
			context,
			content: inObj.content,
			hydration: [],
		} as GJContentFormat;

		const capabilities = ContextCapabilities.getForContext(context);
		outObj = this.validate(outObj, capabilities);

		return outObj;
	}

	/**
	 * Validates GJ Content Format data by removing incorrect/empty nodes
	 */
	public static validate(data: GJContentFormat, capabilities: ContextCapabilities | null = null) {
		// If the content is completely empty, we add one empty paragraph
		if (data.content.length === 0) {
			data.content.push({
				type: 'paragraph',
			} as GJContentObject);
		}

		// Remove empty paragraphs from the beginning/end of the main node, except the last one
		while (
			data.content.length > 1 &&
			data.content[0].type === 'paragraph' &&
			!data.content[0].content
		) {
			data.content.shift();
		}
		while (
			data.content.length > 1 &&
			data.content[data.content.length - 1].type === 'paragraph' &&
			!data.content[data.content.length - 1].content
		) {
			data.content.pop();
		}

		if (capabilities instanceof ContextCapabilities) {
			arrayRemove(
				data.content,
				i =>
					(i.type === 'mediaItem' && !capabilities.media) ||
					(i.type === 'embed' && !capabilities.hasAnyEmbed) ||
					(i.type === 'codeBlock' && !capabilities.codeBlock) ||
					(i.type === 'blockquote' && !capabilities.blockquote) ||
					(i.type === 'gjEmoji' && !capabilities.gjEmoji) ||
					(i.type === 'spoiler' && !capabilities.spoiler) ||
					((i.type === 'orderedList' || i.type === 'bulletList') && !capabilities.lists)
			);
		}

		return data;
	}
}
