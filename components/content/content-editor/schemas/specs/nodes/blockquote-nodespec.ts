import { Node, NodeSpec } from 'prosemirror-model';

export const blockquote = {
	group: 'block',
	content: 'inline*',
	defining: true,
	toDOM: (_: Node) => ['blockquote', 0],
	parseDOM: [{ tag: 'blockquote' }],
} as NodeSpec;
