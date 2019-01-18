import View from '!view!./paragraph.html';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { getComponent } from '../base/base-component';

@View
@Component({
	components: {},
})
export class AppContentViewerParagraph extends Vue {
	@Prop(Array)
	content!: any[];

	getComponent(child: any) {
		if (child && child.type) {
			return getComponent(child.type);
		}
	}
}
