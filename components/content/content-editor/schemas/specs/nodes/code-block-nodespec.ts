import { Node, NodeSpec } from 'prosemirror-model';

export const codeBlock = {
	group: 'block',
	marks: '',
	defining: true,
	code: true,
	content: '(text | hardBreak)*',
	toDOM: (_: Node) => ['pre', 0],
	parseDOM: [{ tag: 'pre' }],
} as NodeSpec;
