import View from '!view!./suggestion.html?style=./suggestion.styl';
import Vue from 'vue';
import { Component, Emit, Prop } from 'vue-property-decorator';

@View
@Component({})
export class AppTagSuggestion extends Vue {
	@Prop(Array)
	tags!: string[];

	@Prop(String)
	text!: string;

	@Emit('tag')
	emitTag(_tag: string) {}

	get shouldShow() {
		return this.tags.length && this.recommendedTags.length + this.otherTags.length > 0;
	}

	get lcText() {
		return this.text.toLowerCase();
	}

	get recommendedTags() {
		if (this.tags.length === 0) {
			return [];
		}

		return this.tags
			.map(t => {
				const count = this.lcText.split(t.toLowerCase()).length - 1;
				const hashtagCount = this.lcText.split('#' + t.toLowerCase()).length - 1;
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
				this.lcText.split('#' + t.toLowerCase()).length - 1 === 0
		);
	}
}
