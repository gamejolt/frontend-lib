import { GJContentObject } from 'game-jolt-frontend-lib/components/content/adapter/definitions';
import { AppContentEmbed } from 'game-jolt-frontend-lib/components/content/components/embed/embed';
import { ContentOwner } from 'game-jolt-frontend-lib/components/content/content-viewer/content-owner';
import Vue, { CreateElement } from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@Component({})
export class AppContentViewerEmbed extends Vue {
	@Prop(Object)
	data!: GJContentObject;
	@Prop(Object)
	owner!: ContentOwner;

	render(h: CreateElement) {
		return h(AppContentEmbed, {
			props: {
				type: this.data.attrs.type,
				source: this.data.attrs.source,
				isEditing: false,
				capabilities: this.owner.getCapabilities(),
				hydrator: this.owner.getHydrator(),
			},
		});
	}
}
