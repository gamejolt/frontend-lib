import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { ContentObject } from '../../../content-object';

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
