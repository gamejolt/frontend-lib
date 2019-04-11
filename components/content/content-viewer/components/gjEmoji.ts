import Vue, { CreateElement } from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { ContentObject } from '../../content-object';

@Component({})
export class AppContentViewerGJEmoji extends Vue {
	@Prop(ContentObject)
	data!: ContentObject;

	render(h: CreateElement) {
		return h('span', {
			class: 'emoji emoji-' + this.data.attrs.type,
			domProps: { title: `:${this.data.attrs.type}:` },
		});
	}
}
