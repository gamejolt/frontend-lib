import { GJContentObject } from 'game-jolt-frontend-lib/components/content/adapter/definitions';
import { renderChildren } from 'game-jolt-frontend-lib/components/content/content-viewer/components/base-component';
import { ContentOwner } from 'game-jolt-frontend-lib/components/content/content-viewer/content-owner';
import Vue, { CreateElement } from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@Component({})
export class AppContentViewerCodeBlock extends Vue {
	@Prop(Object)
	data!: GJContentObject;
	@Prop(Object)
	owner!: ContentOwner;

	render(h: CreateElement) {
		return h('pre', renderChildren(h, this.owner, this.data.content));
	}
}
