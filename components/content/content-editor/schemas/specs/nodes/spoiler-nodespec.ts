import { Node, NodeSpec } from 'prosemirror-model';

export const spoiler = {
	group: 'block',
	content: 'block*',
	toDOM: (_: Node) => [
		'blockquote',
		{
			spoiler: 'true',
			class: 'editor-spoiler',
		},
		0,
	],
	parseDOM: [{ tag: 'blockquote[spoiler]' }],
} as NodeSpec;
