import { ContentContainer } from 'game-jolt-frontend-lib/components/content/content-container';
import {
	ContentContext,
	ContextCapabilities,
} from 'game-jolt-frontend-lib/components/content/content-context';
import { ContentObject } from 'game-jolt-frontend-lib/components/content/content-object';

export type ProsemirrorEditorFormat = {
	type: 'doc';
	content: ContentObject[];
};

/**
 * Adapts the GJ Content Format to the format the prosemirror content editor needs
 */
export class ContentFormatAdapter {
	/**
	 * Converts from the GJ Content Format to the editor format
	 */
	public static adaptIn(inObj: ContentContainer) {
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
		let outObj = new ContentContainer(context, inObj.content);

		const capabilities = ContextCapabilities.getForContext(context);
		outObj = this.validate(outObj, capabilities);

		return outObj;
	}

	/**
	 * Validates GJ Content Format data by removing incorrect/empty nodes
	 */
	public static validate(
		data: ContentContainer,
		capabilities: ContextCapabilities | null = null
	) {
		// If the content is completely empty, we add one empty paragraph
		if (data.content.length === 0) {
			data.content.push({
				type: 'paragraph',
			} as ContentObject);
		}

		// Remove nodes with types not allowed in the context
		if (capabilities instanceof ContextCapabilities) {
			data.content = data.content.filter(
				i =>
					!(
						(i.type === 'mediaItem' && !capabilities.media) ||
						(i.type === 'embed' && !capabilities.hasAnyEmbed) ||
						(i.type === 'codeBlock' && !capabilities.codeBlock) ||
						(i.type === 'blockquote' && !capabilities.blockquote) ||
						(i.type === 'gjEmoji' && !capabilities.gjEmoji) ||
						(i.type === 'spoiler' && !capabilities.spoiler) ||
						(i.type === 'table' && !capabilities.table) ||
						((i.type === 'orderedList' || i.type === 'bulletList') &&
							!capabilities.lists)
					)
			);
		}

		// Remove certain empty nodes
		data.content = data.content.filter(i => !this.isEmptyObj(i));

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

		return data;
	}

	private static isEmptyObj(obj: ContentObject): boolean {
		if (obj.type === 'embed') {
			return !obj.attrs.type || !obj.attrs.source;
		}

		if (obj.type === 'codeBlock' || obj.type === 'blockquote' || obj.type === 'spoiler') {
			if (obj.content === null || obj.content === undefined || obj.content === []) {
				return true;
			}
			if (obj.content.length === 1) {
				return this.isEmptyObj(obj.content[0]);
			}
		}

		return false;
	}
}
