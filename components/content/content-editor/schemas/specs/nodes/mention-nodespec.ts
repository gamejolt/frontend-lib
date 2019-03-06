import { Node, NodeSpec } from 'prosemirror-model';

export const mention = {
	group: 'inline',
	marks: '',
	inline: true,
	atom: true,
	attrs: {
		value: { default: '' },
	},

	toDOM: (node: Node) => [
		'span',
		{
			mention: 'true',
			username: node.attrs.value,
		},
	],

	parseDOM: [
		{
			tag: 'span[mention]',
			getAttrs: (domNode: Element) => {
				return {
					value: domNode.getAttribute('username'),
				};
			},
		},
	],
} as NodeSpec;
