import Vue, { CreateElement } from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { ContentObject } from '../../content-object';
import { ContentOwner } from '../../content-owner';
import { renderChildren } from './base-component';

@Component({})
export class AppContentViewerTableCell extends Vue {
	@Prop(ContentObject)
	data!: ContentObject;
	@Prop(Object)
	owner!: ContentOwner;

	render(h: CreateElement) {
		return h(
			this.data.attrs.isHeader ? 'th' : 'td',
			{ domProps: { style: 'text-align: center;' } },
			renderChildren(h, this.owner, this.data.content)
		);
	}
}
