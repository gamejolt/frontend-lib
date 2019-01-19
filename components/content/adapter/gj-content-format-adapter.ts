import {
	GJContentFormat,
	ProsemirrorEditorFormat,
} from 'game-jolt-frontend-lib/components/content/adapter/definitions';
import { ContentContext } from '../content-context';

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
		const outObj = {
			version: GJ_FORMAT_VERSION,
			createdOn: Date.now(),
			context,
			content: inObj.content,
			hydration: [],
		} as GJContentFormat;

		return outObj;
	}
}
