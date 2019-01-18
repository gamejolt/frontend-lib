import View from '!view!./base-component.html';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { AppContentViewerParagraph } from '../paragraph/paragraph';
import { AppContentViewerText } from '../text/text';

export function getComponent(type: string) {
	switch (type) {
		case 'paragraph':
			return AppContentViewerParagraph;
		case 'text':
			return AppContentViewerText;
	}
}

@View
@Component({
	components: {
		AppContentViewerParagraph,
	},
})
export class AppContentViewerBaseComponent extends Vue {
	@Prop(Array)
	content!: any[];

	getComponent(child: any) {
		if (child && child.type) {
			return getComponent(child.type);
		}
	}
}
