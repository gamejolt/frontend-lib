import View from '!view!./tag.html?style=./tag.styl';
import { GJContentObject } from 'game-jolt-frontend-lib/components/content/adapter/definitions';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@View
@Component({})
export class AppContentViewerTag extends Vue {
	@Prop(Object)
	data!: GJContentObject;

	get text() {
		return this.data.attrs.text;
	}

	get url() {
		const searchTerm = encodeURIComponent(`#${this.text}`);
		return `/search?q=${searchTerm}`;
	}
}
