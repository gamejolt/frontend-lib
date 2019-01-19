import View from '!view!./content-viewer.html?style=./content-viewer.styl';
import { ContentOwner } from 'game-jolt-frontend-lib/components/content/content-owner';
import { AppContentViewerBaseComponent } from 'game-jolt-frontend-lib/components/content/content-viewer/components/base-component';
import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { GJContentFormat, GJContentObject } from '../adapter/definitions';
import { ContentContext, ContextCapabilities } from '../content-context';
import { ContentHydrator } from '../content-hydrator';

@View
@Component({
	components: {
		AppContentViewerBaseComponent,
	},
})
export class AppContentViewer extends Vue implements ContentOwner {
	@Prop(String)
	source!: string;

	@Prop(String)
	contentContext!: ContentContext;

	content: GJContentObject[] = [];
	hydrator: ContentHydrator = new ContentHydrator();

	get owner() {
		return this;
	}

	getCapabilities() {
		return ContextCapabilities.getForContext(this.contentContext);
	}

	getHydrator() {
		return this.hydrator;
	}

	@Watch('source')
	updatedSource() {
		if (this.source) {
			const sourceObj = JSON.parse(this.source) as GJContentFormat;
			this.content = sourceObj.content;
			this.hydrator = new ContentHydrator(sourceObj.hydration);
		} else {
			this.content = [];
			this.hydrator = new ContentHydrator();
		}
	}
}
