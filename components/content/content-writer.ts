import { ContentContainer } from 'game-jolt-frontend-lib/components/content/content-container';
import { ContentObject } from 'game-jolt-frontend-lib/components/content/content-object';

export default class ContentWriter {
	private _container: ContentContainer;

	constructor(container: ContentContainer) {
		this._container = container;
	}

	public ensureParagraph(): ContentObject {
		let p: ContentObject;

		if (
			this._container.lastChild === null ||
			(this._container.lastChild instanceof ContentObject &&
				this._container.lastChild.type !== 'paragraph')
		) {
			p = new ContentObject('paragraph');
			this._container.appendChild(p);
		} else {
			p = this._container.lastChild!;
		}

		return p;
	}

	public appendTag(tag: string) {
		const tagObj = new ContentObject('tag');
		tagObj.attrs.text = tag;

		const parentParagraph = this.ensureParagraph();
		parentParagraph.appendChild(tagObj);
	}
}
