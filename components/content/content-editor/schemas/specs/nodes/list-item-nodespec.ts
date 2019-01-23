import { Node, NodeSpec } from 'prosemirror-model';

export const listItem = {
	content: 'paragraph block*',
	toDOM: (_: Node) => ['li', 0],
	parseDOM: [{ tag: 'li' }],
	defining: true,
} as NodeSpec;
