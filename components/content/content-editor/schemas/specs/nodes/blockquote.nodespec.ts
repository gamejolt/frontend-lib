import { Node, NodeSpec } from 'prosemirror-model';

export const blockquote = {
	group: 'block',
	content: '(text | hardBreak | gjEmoji)*',
	toDOM: (_: Node) => ['blockquote', 0],
	parseDOM: [{ tag: 'blockquote' }],
} as NodeSpec;
