import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./item.html?style=./item.styl';

@View
@Component({})
export class AppTimelineListItem extends Vue {
	@Prop(Boolean) isActive?: boolean;
	@Prop(Boolean) isNew?: boolean;
}
