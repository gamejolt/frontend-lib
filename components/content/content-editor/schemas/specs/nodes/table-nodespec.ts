import { Node, NodeSpec } from 'prosemirror-model';

export const table = {
	group: 'block',
	content: 'tableRow+',
	toDOM: (_: Node) => ['table', 0],
	parseDOM: [{ tag: 'table' }],
} as NodeSpec;
