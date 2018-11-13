import View from '!view!./suggestion.html?style=./suggestion.styl';
import Vue from 'vue';
import { Component, Emit, Prop } from 'vue-property-decorator';

export class TagSuggester {
	public tags!: string[];
	public text!: string;

	constructor(tags: string[], text: string) {
		Vue.set(this, 'tags', tags);
		Vue.set(this, 'text', text);
	}

	get shouldShow() {
		return this.tags.length && this.recommendedTags.length + this.otherTags.length > 0;
	}

	get recommendedTags() {
		if (this.tags.length === 0) {
			return [];
		}

		return this.tags
			.map(t => {
				const count = this.text.split(t.toLowerCase()).length - 1;
				const hashtagCount = this.text.split('#' + t.toLowerCase()).length - 1;
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

		return this.tags.filter(
			t =>
				recommended!.indexOf(t) === -1 &&
				this.text.split('#' + t.toLowerCase()).length - 1 === 0
		);
	}
}

@View
@Component({})
export class AppTagSuggestion extends Vue {
	@Prop(TagSuggester)
	suggester!: TagSuggester;

	@Emit('tag')
	emitTag(_tag: string) {}

	/**
	 * This will do a simple recommendation of tags based on their text content.
	 */
	get recommendedTags() {
		return this.suggester.recommendedTags;
	}

	get otherTags() {
		return this.suggester.otherTags;
	}
}
