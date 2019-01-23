import { GJContentObject } from 'game-jolt-frontend-lib/components/content/adapter/definitions';
import { ContentOwner } from 'game-jolt-frontend-lib/components/content/content-owner';
import { renderChildren } from 'game-jolt-frontend-lib/components/content/content-viewer/components/base-component';
import Vue, { CreateElement } from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@Component({})
export class AppContentViewerList extends Vue {
	@Prop(Object)
	data!: GJContentObject;
	@Prop(Object)
	owner!: ContentOwner;

	render(h: CreateElement) {
		if (this.data.type === 'bulletList') {
			return h('ul', renderChildren(h, this.owner, this.data.content));
		} else if (this.data.type === 'orderedList') {
			return h('ol', renderChildren(h, this.owner, this.data.content));
		}
		// Shouldn't happen because child type is guarded by renderChildren
		throw new Error('Unknown list type encountered.');
	}
}
