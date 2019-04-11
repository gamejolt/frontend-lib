import Vue, { CreateElement } from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { ContentObject } from '../../../content-object';
import { ContentOwner } from '../../../content-owner';
import { renderChildren } from '../base-component';
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
