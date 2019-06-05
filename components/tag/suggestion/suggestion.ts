import Vue from 'vue';
import { Component, Emit, Prop } from 'vue-property-decorator';
import { ContentDocument } from '../../content/content-document';

@Component({})
export default class AppTagSuggestion extends Vue {
	@Prop(Array)
	tags!: string[];

	@Prop(String)
	text!: string;

	@Prop(ContentDocument)
	content!: ContentDocument;

	@Emit('tag')
	emitTag(_tag: string) {}

	get shouldShow() {
		return this.tags.length && this.recommendedTags.length + this.otherTags.length > 0;
	}

	get lcText() {
		let text = '';
		if (this.text) {
			text += this.text.toLowerCase();
		}
		if (this.content instanceof ContentDocument) {
			text += this.content
				.getChildrenByType('text')
				.map(i => i.text)
				.join(' ')
				.toLowerCase();
		}

		return text;
	}

	get recommendedTags() {
		if (this.tags.length === 0) {
			return [];
		}

		return this.tags
			.map(t => {
				const count = this.lcText.split(t.toLowerCase()).length - 1;
				let hashtagCount = 0;
				if (this.content instanceof ContentDocument) {
					hashtagCount = this.content
						.getMarks('tag')
						.map(i => i.attrs.tag as string)
						.filter(i => i.toLowerCase() === t.toLowerCase()).length;
				} else {
					hashtagCount = this.lcText.split('#' + t.toLowerCase()).length - 1;
				}
				return {
					tag: t,
					count: hashtagCount > 0 ? -1 : count,
				};
			})
			.filter(w => w.count > 0)
			.sort((a, b) => {
				if (a.count > b.count) {
					return -1;
				} else if (a.count < b.count) {
					return 1;
				}
				return 0;
			})
			.map(w => w.tag);
	}

	get otherTags() {
		if (this.tags.length === 0) {
			return [];
		}

		const recommended = this.recommendedTags;

		if (this.content instanceof ContentDocument) {
			const contentTags = this.content.getMarks('tag').map(i => i.attrs.tag);
			return this.tags.filter(
				t => recommended!.indexOf(t) === -1 && contentTags!.indexOf(t) === -1
			);
		} else {
			return this.tags.filter(
				t =>
					recommended!.indexOf(t) === -1 &&
					this.lcText.split('#' + t.toLowerCase()).length - 1 === 0
			);
		}
	}
}
