import { Node, NodeSpec } from 'prosemirror-model';

export const gif = {
	group: 'block',
	marks: '',
	draggable: true,
	selectable: true,
	attrs: {
		id: {
			default: '',
		},
		width: {
			default: 0,
		},
		height: {
			default: 0,
		},
		service: {
			default: '',
		},
		media: {
			default: {},
		},
	},
	toDOM: (node: Node) => [
		'div',
		{
			'gif-id': node.attrs.id,
			'gif-width': node.attrs.width,
			'gif-height': node.attrs.height,
			'gif-service': node.attrs.service,
			'gif-media': JSON.stringify(node.attrs.media),
		},
	],
	parseDOM: [
		{
			tag: 'div[gif-id]',
			getAttrs: (domNode: Element) => {
				return {
					id: parseInt(domNode.getAttribute('gif-id')!, 10),
					width: parseInt(domNode.getAttribute('gif-width')!, 10),
					height: parseInt(domNode.getAttribute('gif-height')!, 10),
					service: domNode.getAttribute('gif-service'),
					media: JSON.parse(domNode.getAttribute('gif-media') || '{}'),
				};
			},
		},
	],
} as NodeSpec;
