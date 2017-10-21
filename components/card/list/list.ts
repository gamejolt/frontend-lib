import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./list.html?style=./list.styl';

@View
@Component({})
export class AppCardList extends Vue {
	@Prop(Array) items: any[];
	@Prop({ default: null })
	activeItem: any | null;
	@Prop(Boolean) isAdding?: boolean;

	isDraggable = false;

	activate(item: any | null) {
		this.$emit('activate', item);
	}
}
