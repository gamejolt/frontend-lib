import { ContentObject } from 'game-jolt-frontend-lib/components/content/content-object';
import { ContentOwner } from 'game-jolt-frontend-lib/components/content/content-owner';
import { renderChildren } from 'game-jolt-frontend-lib/components/content/content-viewer/components/base-component';
import Vue, { CreateElement } from 'vue';
import { Component, Prop } from 'vue-property-decorator';

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
