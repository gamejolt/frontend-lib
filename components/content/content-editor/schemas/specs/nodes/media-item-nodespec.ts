import { Node, NodeSpec } from 'prosemirror-model';

export const mediaItem = {
	group: 'block',
	marks: '',
	draggable: true,
	selectable: true,
	attrs: {
		id: {
			default: 0,
		},
		width: {
			default: 0,
		},
		height: {
			default: 0,
		},
	},
	toDOM: (node: Node) => [
		'div',
		{
			'media-item-id': node.attrs.id,
			'media-item-width': node.attrs.width,
			'media-item-height': node.attrs.height,
		},
	],
	parseDOM: [
		{
			tag: 'div[media-item-id]',
			getAttrs: (domNode: Element) => {
				return {
					id: domNode.getAttribute('media-item-id'),
					width: domNode.getAttribute('media-item-width'),
					height: domNode.getAttribute('media-item-height'),
				};
			},
		},
	],
} as NodeSpec;
