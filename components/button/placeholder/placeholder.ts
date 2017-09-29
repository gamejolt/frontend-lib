import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./placeholder.html?style=./placeholder.styl';

@View
@Component({})
export class AppButtonPlaceholder extends Vue {
	@Prop(Boolean) sparse?: boolean;
	@Prop(Boolean) circle?: boolean;
}
