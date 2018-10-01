import View from '!view!./placeholder.html?style=./placeholder.styl';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@View
@Component({})
export class AppButtonPlaceholder extends Vue {
	@Prop(Boolean)
	sparse?: boolean;
	@Prop(Boolean)
	circle?: boolean;
	@Prop(Boolean)
	block?: boolean;
}
