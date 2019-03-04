import { GJContentObject } from 'game-jolt-frontend-lib/components/content/adapter/definitions';
import Vue, { CreateElement } from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@Component({})
export class AppContentViewerTag extends Vue {
	@Prop(Object)
	data!: GJContentObject;

	render(h: CreateElement) {
		return h('span', { class: 'tag', domProps: { innerHTML: '#' + this.data.attrs.text } });
	}
}
