import { ContentObject } from 'game-jolt-frontend-lib/components/content/content-object';
import { ContentOwner } from 'game-jolt-frontend-lib/components/content/content-owner';
import { renderChildren } from 'game-jolt-frontend-lib/components/content/content-viewer/components/base-component';
import Vue, { CreateElement } from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@Component({})
export class AppContentViewerSpoiler extends Vue {
	@Prop(ContentObject)
	data!: ContentObject;
	@Prop(Object)
	owner!: ContentOwner;

	render(h: CreateElement) {
		return h(
			'blockquote',
			{ class: 'spoiler' },
			renderChildren(h, this.owner, this.data.content)
		);
	}
}
