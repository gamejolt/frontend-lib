import { GJContentObject } from 'game-jolt-frontend-lib/components/content/adapter/definitions';
import { ContentOwner } from 'game-jolt-frontend-lib/components/content/content-owner';
import { renderChildren } from 'game-jolt-frontend-lib/components/content/content-viewer/components/base-component';
import Vue, { CreateElement } from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@Component({})
export class AppContentViewerHeading extends Vue {
	@Prop(Object)
	data!: GJContentObject;
	@Prop(Object)
	owner!: ContentOwner;

	render(h: CreateElement) {
		return h(
			'h' + this.data.attrs.level,
			{ class: 'content-viewer-heading' },
			renderChildren(h, this.owner, this.data.content)
		);
	}
}
