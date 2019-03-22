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
		caption: {
			default: '',
		},
		align: {
			default: 'center',
		},
		href: {
			default: '',
		},
	},
	toDOM: (node: Node) => [
		'div',
		{
			'media-item-id': node.attrs.id,
			'media-item-width': node.attrs.width,
			'media-item-height': node.attrs.height,
			'media-item-caption': node.attrs.caption,
			'media-item-align': node.attrs.align,
			'media-item-href': node.attrs.href,
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
					caption: domNode.getAttribute('media-item-caption'),
					align: domNode.getAttribute('media-item-align'),
					href: domNode.getAttribute('media-item-href'),
				};
			},
		},
	],
} as NodeSpec;
