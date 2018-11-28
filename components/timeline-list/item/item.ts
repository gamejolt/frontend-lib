import View from '!view!./item.html';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import './item-content.styl';

@View
@Component({})
export class AppTimelineListItem extends Vue {
	@Prop(Boolean)
	isActive?: boolean;

	@Prop(Boolean)
	isNew?: boolean;

	@Prop(Boolean)
	isThread?: boolean;

	@Prop(Boolean)
	isLast?: boolean;
}
