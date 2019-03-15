import { ContentObject } from 'game-jolt-frontend-lib/components/content/content-object';
import Vue, { CreateElement } from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@Component({})
export class AppContentViewerGJEmoji extends Vue {
	@Prop(Object)
	data!: ContentObject;

	render(h: CreateElement) {
		return h('span', {
			class: 'emoji emoji-' + this.data.attrs.type,
			domProps: { title: `:${this.data.attrs.type}:` },
		});
	}
}
