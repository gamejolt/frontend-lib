import { GJContentObject } from 'game-jolt-frontend-lib/components/content/adapter/definitions';
import Vue, { CreateElement } from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@Component({})
export class AppContentViewerGJEmoji extends Vue {
	@Prop(Object)
	data!: GJContentObject;

	render(h: CreateElement) {
		return h('span', {
			class: 'emoji emoji-' + this.data.attrs.type,
			domProps: { title: `:${this.data.attrs.type}:` },
		});
	}
}
