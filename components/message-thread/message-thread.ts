import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./message-thread.html';

import { AppTimelineList } from '../timeline-list/timeline-list';

@View
@Component({
	components: {
		AppTimelineList,
	},
})
export class AppMessageThread extends Vue {
	@Prop(Boolean) isNested?: boolean;
}
