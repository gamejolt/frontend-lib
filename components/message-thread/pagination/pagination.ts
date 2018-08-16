import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./pagination.html';

import { AppPagination } from '../../pagination/pagination';
import { AppTimelineListItem } from '../../timeline-list/item/item';

@View
@Component({
	components: {
		AppTimelineListItem,
		AppPagination,
	},
})
export class AppMessageThreadPagination extends Vue {
	@Prop(Number) itemsPerPage!: number;
	@Prop(Number) totalItems!: number;
	@Prop(Number) currentPage!: number;
	@Prop(Boolean) pager?: boolean;
	@Prop(Boolean) preventUrlChange?: boolean;

	get hasPages() {
		return this.totalItems > this.itemsPerPage;
	}

	pageChange(...args: any[]) {
		this.$emit('pagechange', ...args);
	}
}
