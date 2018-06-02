import { ContentEditorNodeParagraphModel } from './paragraph.model';
import { FunctionalComponentOptions } from 'vue/types/options';

export const AppContentBlockEditorNodeParagraph = {
	functional: true,
	props: {
		node: {
			type: ContentEditorNodeParagraphModel,
			required: true,
		},
	},
	render(h, context) {
		const node = context.props.node as ContentEditorNodeParagraphModel;
		return node.render(h);
	},
} as FunctionalComponentOptions;
