import { FunctionalComponentOptions } from 'vue/types/options';
import { ContentEditorNodeHeadingModel } from './heading.model';

export const AppContentBlockEditorNodeHeading = {
	functional: true,
	props: {
		node: {
			type: ContentEditorNodeHeadingModel,
			required: true,
		},
	},
	render(h, context) {
		const node = context.props.node as ContentEditorNodeHeadingModel;
		return node.render(h);
	},
} as FunctionalComponentOptions;
