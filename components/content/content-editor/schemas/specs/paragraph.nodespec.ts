import { Node, NodeSpec } from 'prosemirror-model';

export const paragraph = {
	group: 'block',
	content: 'text*',
	toDOM: (_: Node) => ['p', 0],
	parseDOM: [{ tag: 'p' }],
} as NodeSpec;
