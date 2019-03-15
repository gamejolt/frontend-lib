import { ContentObject } from 'game-jolt-frontend-lib/components/content/content-object';
import { ContentOwner } from 'game-jolt-frontend-lib/components/content/content-owner';
import { renderChildren } from 'game-jolt-frontend-lib/components/content/content-viewer/components/base-component';
import Vue, { CreateElement } from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import './code.css';

@Component({})
export class AppContentViewerCodeBlock extends Vue {
	@Prop(ContentObject)
	data!: ContentObject;
	@Prop(Object)
	owner!: ContentOwner;

	render(h: CreateElement) {
		return h(
			'pre',
			{ class: 'content-viewer-code-block' },
			renderChildren(h, this.owner, this.data.content)
		);
	}
}
