import { Node, NodeSpec } from 'prosemirror-model';

export const img = {
	group: 'block',
	marks: '',
	draggable: true,
	selectable: true,
	attrs: {
		src: {
			default: 'https://m.gjcdn.net/fireside-post-image/700/1532101-hk2qzijv-v3.jpg',
		},
	},
	toDOM: (_: Node) => ['div'],
	parseDOM: [
		{
			tag: 'div',
			getAttrs: (domNode: Element) => {
				return {
					src: domNode.getAttribute('src'),
				};
			},
		},
	],
} as NodeSpec;
