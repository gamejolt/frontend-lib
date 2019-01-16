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
	toDOM: (node: Node) => [
		'div',
		{
			'img-src': node.attrs.src,
		},
	],
	parseDOM: [
		{
			tag: 'div[img-src]',
			getAttrs: (domNode: Element) => {
				const src = domNode.getAttribute('img-src');
				return { src };
			},
		},
	],
} as NodeSpec;
