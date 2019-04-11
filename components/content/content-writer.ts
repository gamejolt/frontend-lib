import { ContentContainer } from './content-container';
import { ContentObject } from './content-object';

export class ContentWriter {
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
		if (parentParagraph.lastChild instanceof ContentObject) {
			if (parentParagraph.lastChild.type === 'text') {
				parentParagraph.lastChild.text += ' ';
			} else {
				const t = new ContentObject('text');
				t.text = ' ';
				parentParagraph.appendChild(t);
			}
		}

		parentParagraph.appendChild(tagObj);
	}
}
