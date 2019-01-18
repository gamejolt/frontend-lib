import View from '!view!./content-viewer.html?style=./content-viewer.styl';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@View
@Component({
	components: {},
})
export class AppContentViewer extends Vue {
	@Prop(Object)
	source!: object;
}
