import View from '!view!./content-viewer.html?style=./content-viewer.styl';
import { ContentOwner } from 'game-jolt-frontend-lib/components/content/content-owner';
import { AppContentViewerBaseComponent } from 'game-jolt-frontend-lib/components/content/content-viewer/components/base-component';
import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { GJContentFormat } from '../adapter/definitions';
import { ContextCapabilities } from '../content-context';
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

	data: GJContentFormat | null = null;
	hydrator: ContentHydrator = new ContentHydrator();

	get owner() {
		return this;
	}

	get shouldShowContent() {
		return !!this.data;
	}

	getCapabilities() {
		if (this.data) {
			return ContextCapabilities.getForContext(this.data.context);
		}
		return ContextCapabilities.getEmpty();
	}

	getHydrator() {
		return this.hydrator;
	}

	@Watch('source')
	updatedSource() {
		if (this.source) {
			const sourceObj = JSON.parse(this.source) as GJContentFormat;
			this.data = sourceObj;
			this.hydrator = new ContentHydrator(sourceObj.hydration);
		} else {
			this.data = {} as GJContentFormat;
			this.hydrator = new ContentHydrator();
		}
	}
}
