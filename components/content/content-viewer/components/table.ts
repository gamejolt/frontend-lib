import Vue, { CreateElement } from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { ContentObject } from '../../content-object';
import { ContentOwner } from '../../content-owner';
import { renderChildren } from './base-component';

@Component({})
export class AppContentViewerTable extends Vue {
	@Prop(ContentObject)
	data!: ContentObject;
	@Prop(Object)
	owner!: ContentOwner;

	render(h: CreateElement) {
		const rows = (this.data.content as ContentObject[]).slice();
		if (rows.length > 0) {
			const firstRow = rows.shift()!;
			if (firstRow.hasChildren && firstRow.firstChild!.attrs.isHeader) {
				const thead = h('thead', renderChildren(h, this.owner, [firstRow]));
				const tbody = h('tbody', renderChildren(h, this.owner, rows));
				return h('table', { class: 'content-viewer-table meme' }, [thead, tbody]);
			}
		}

		return h('table', { class: 'content-viewer-table' }, [
			h('tbody', renderChildren(h, this.owner, this.data.content)),
		]);
	}
}
