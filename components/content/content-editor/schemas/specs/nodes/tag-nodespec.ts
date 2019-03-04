import { Node, NodeSpec } from 'prosemirror-model';

export const tag = {
	group: 'inline',
	marks: '',
	inline: true,
	attrs: {
		text: {
			default: '',
		},
	},

	toDOM: (node: Node) => [
		'span',
		{
			'tag-text': node.attrs.text,
		},
	],

	parseDOM: [
		{
			tag: 'span[tag-text]',
			getAttrs: (domNode: Element) => {
				return {
					text: domNode.getAttribute('tag-text'),
				};
			},
		},
	],
} as NodeSpec;
