import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./content.html';

import { AppTimelineListItem } from '../../timeline-list/item/item';

@View
@Component({
	components: {
		AppTimelineListItem,
	},
})
export class AppMessageThreadContent extends Vue {}
