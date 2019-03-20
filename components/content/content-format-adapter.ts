import { ContentContainer } from 'game-jolt-frontend-lib/components/content/content-container';
import { ContentContext } from 'game-jolt-frontend-lib/components/content/content-context';
import { ContentObject } from 'game-jolt-frontend-lib/components/content/content-object';
import ContentWriter from 'game-jolt-frontend-lib/components/content/content-writer';

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
		let outObj = new ContentContainer(
			context,
			inObj.content.map(i => ContentObject.fromJsonObj(i))
		);

		// Make sure we always have at least one paragraph node
		if (!outObj.hasChildren) {
			const writer = new ContentWriter(outObj);
			writer.ensureParagraph();
		}

		return outObj;
	}
}
