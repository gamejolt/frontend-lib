import { AppContentEmbed } from 'game-jolt-frontend-lib/components/content/components/embed/embed';
import { ContentObject } from 'game-jolt-frontend-lib/components/content/content-object';
import { ContentOwner } from 'game-jolt-frontend-lib/components/content/content-owner';
import Vue, { CreateElement } from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@Component({})
export class AppContentViewerEmbed extends Vue {
	@Prop(ContentObject)
	data!: ContentObject;
	@Prop(Object)
	owner!: ContentOwner;

	render(h: CreateElement) {
		return h(AppContentEmbed, {
			props: {
				type: this.data.attrs.type,
				source: this.data.attrs.source,
				isEditing: false,
				owner: this.owner,
			},
		});
	}
}
