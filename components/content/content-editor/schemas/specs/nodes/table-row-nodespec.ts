import { Node, NodeSpec } from 'prosemirror-model';

export const tableRow = {
	content: 'tableCell+',
	toDOM: (_: Node) => ['tr', 0],
	parseDOM: [{ tag: 'tr' }],
} as NodeSpec;
