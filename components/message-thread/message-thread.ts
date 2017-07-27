import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./message-thread.html';

import { AppTimelineList } from '../timeline-list/timeline-list';

@View
@Component({
	components: {
		AppTimelineList,
	},
})
export class AppMessageThread extends Vue {}
