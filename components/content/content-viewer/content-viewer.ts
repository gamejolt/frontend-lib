import View from '!view!./content-viewer.html?style=./content-viewer.styl';
import { AppContentViewerBaseComponent } from 'game-jolt-frontend-lib/components/content/content-viewer/components/base/base-component';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { GJContentObject } from '../adapter/definitions';

@View
@Component({
	components: {
		AppContentViewerBaseComponent,
	},
})
export class AppContentViewer extends Vue {
	@Prop(String)
	source!: string;

	get content() {
		if (this.source) {
			const obj = JSON.parse(this.source) as GJContentObject;
			return obj.content;
		}
		return [];
	}
}
