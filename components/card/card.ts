import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./card.html';

require('./card.styl');

@View
@Component({})
export class AppCard extends Vue {
	@Prop({ type: Boolean, default: false })
	isDraggable: boolean;
	@Prop({ type: Boolean, default: false })
	isExpandable: boolean;
	@Prop({ type: Boolean, default: false })
	isExpanded: boolean;
	@Prop({ type: Boolean, default: false })
	isInactive: boolean;
	@Prop({ type: Boolean, default: false })
	isDisabled: boolean;
}
