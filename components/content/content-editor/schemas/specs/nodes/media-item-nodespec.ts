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
	},
	toDOM: (node: Node) => [
		'div',
		{
			'media-item-id': node.attrs.id,
		},
	],
	parseDOM: [
		{
			tag: 'div[media-item-id]',
			getAttrs: (domNode: Element) => {
				return {
					id: domNode.getAttribute('media-item-id'),
				};
			},
		},
	],
} as NodeSpec;
