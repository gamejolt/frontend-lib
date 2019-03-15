import View from '!view!./content-viewer.html?style=./content-viewer.styl';
import { ContentContainer } from 'game-jolt-frontend-lib/components/content/content-container';
import { ContentOwner } from 'game-jolt-frontend-lib/components/content/content-owner';
import { AppContentViewerBaseComponent } from 'game-jolt-frontend-lib/components/content/content-viewer/components/base-component';
import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
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
	// DEBUG
	@Prop({ type: Boolean, default: false })
	showSource!: boolean;

	data: ContentContainer | null = null;
	hydrator: ContentHydrator = new ContentHydrator();

	get owner() {
		return this;
	}

	get shouldShowContent() {
		return !!this.data;
	}

	mounted() {
		this.updatedSource();
	}

	getContext() {
		if (this.data) {
			return this.data.context;
		}
		throw new Error('No context assigned to viewer');
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
			const sourceObj = ContentContainer.fromJson(this.source);
			this.data = sourceObj;
			this.hydrator = new ContentHydrator(sourceObj.hydration);
		} else {
			this.data = {} as ContentContainer;
			this.hydrator = new ContentHydrator();
		}
	}

	onClickCopy() {
		(navigator as any).clipboard.writeText(this.source);
	}
}
