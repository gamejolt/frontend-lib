import { GJContentObject } from 'game-jolt-frontend-lib/components/content/adapter/definitions';
import { ContentOwner } from 'game-jolt-frontend-lib/components/content/content-owner';
import { renderChildren } from 'game-jolt-frontend-lib/components/content/content-viewer/components/base-component';
import Vue, { CreateElement } from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@Component({})
export class AppContentViewerBlockquote extends Vue {
	@Prop(Object)
	data!: GJContentObject;
	@Prop(Object)
	owner!: ContentOwner;

	render(h: CreateElement) {
		return h('blockquote', renderChildren(h, this.owner, this.data.content));
	}
}
