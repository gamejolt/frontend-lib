import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import AppBaseContentComponent from '../base/base-content-component.vue';

@Component({
	components: {
		AppBaseContentComponent,
	},
	directives: {},
})
export default class AppContentGif extends Vue {
	@Prop(String)
	gifId!: string;

	@Prop(Number)
	width!: number;

	@Prop(Number)
	height!: number;

	@Prop(String)
	service!: string;

	@Prop(Object)
	media!: any;

	@Prop(Boolean)
	isEditing!: boolean;

	@Prop(Boolean)
	isDisabled!: boolean;

	onRemoved() {
		this.$emit('removed');
	}
}
