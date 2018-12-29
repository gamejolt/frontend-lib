import { Node, NodeSpec } from 'prosemirror-model';

export const img = {
	group: 'block',
	marks: '',
	draggable: false,
	attrs: {
		src: {
			default: 'https://m.gjcdn.net/fireside-post-image/700/1532101-hk2qzijv-v3.jpg',
		},
	},
	toDOM: (node: Node) => [
		'img',
		{
			src: node.attrs.src,
		},
	],
	parseDOM: [
		{
			tag: 'img',
			getAttrs: (domNode: Element) => {
				return domNode.getAttribute('src');
			},
		},
	],
} as NodeSpec;
