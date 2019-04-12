import { ContentContainerModel } from './content-container-model';
import { ContentContext } from './content-context';
import { ContentDocument } from './content-document';

/**
 * Caches ContentDocument.hasContent checks
 */
export class ContentSetCache {
	private readonly _container: ContentContainerModel;
	private readonly _context: ContentContext;

	private _hasContent = false;
	private _checkValue: string | undefined = undefined;

	constructor(container: ContentContainerModel, context: ContentContext) {
		this._container = container;
		this._context = context;
	}

	public get hasContent() {
		const content = this._container.getContent(this._context);
		if (this._checkValue !== content) {
			const doc = ContentDocument.fromJson(content);
			this._hasContent = doc.hasContent;
		}

		return this._hasContent;
	}
}
