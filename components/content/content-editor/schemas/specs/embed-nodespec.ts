import { Node, NodeSpec } from 'prosemirror-model';

export const embed = {
	group: 'block',
	marks: '',
	draggable: true,
	selectable: true,
	attrs: {
		embedType: {
			default: 'youtube-video',
		},
		embedSource: {
			default: 'WfDS_2omcHw',
		},
	},
	toDOM: (_: Node) => ['div'],
	parseDOM: [
		{
			tag: 'div',
			getAttrs: (domNode: Element) => {
				return {
					embedType: domNode.getAttribute('embedType'),
					embedSource: domNode.getAttribute('embedSource'),
				};
			},
		},
	],
} as NodeSpec;
