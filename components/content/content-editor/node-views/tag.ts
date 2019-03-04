import { AppContentTag } from 'game-jolt-frontend-lib/components/content/components/tag/tag';
import { BaseNodeView } from './base';

export class TagNodeView extends BaseNodeView {
	protected createDOM() {
		// We want to override the default 'div' container to be able to inline this Vue component
		return document.createElement('span');
	}

	mounted() {
		const vm = new AppContentTag({
			propsData: {
				text: this.node.attrs.text,
			},
		});
		this.mountVue(vm);
	}
}
