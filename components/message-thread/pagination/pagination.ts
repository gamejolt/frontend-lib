import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./pagination.html';

import { AppPagination } from '../../pagination/pagination';

@View
@Component({
	components: {
		AppPagination,
	},
})
export class AppMessageThreadPagination extends Vue {
	@Prop([Number])
	itemsPerPage: number;
	@Prop([Number])
	totalItems: number;
	@Prop([Number])
	currentPage: number;
	@Prop([Boolean])
	pager?: boolean;
	@Prop([Boolean])
	preventUrlChange?: boolean;

	get hasPages() {
		return this.totalItems > this.itemsPerPage;
	}

	pageChange(...args: any[]) {
		this.$emit('pagechange', ...args);
	}
}
