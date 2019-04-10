import { ContentObject } from 'game-jolt-frontend-lib/components/content/content-object';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@Component({})
export default class AppContentViewerTag extends Vue {
	@Prop(ContentObject)
	data!: ContentObject;

	get text() {
		return this.data.attrs.text;
	}

	get url() {
		const searchTerm = encodeURIComponent(`#${this.text}`);
		return `/search?q=${searchTerm}`;
	}
}
