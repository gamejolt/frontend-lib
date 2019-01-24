import { Node, NodeSpec } from 'prosemirror-model';

export const tableCell = {
	content: 'inline*',
	toDOM: (_: Node) => ['td', 0],
	parseDOM: [{ tag: 'td' }],
} as NodeSpec;
