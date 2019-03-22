import { Node, NodeSpec } from 'prosemirror-model';

export const tableCell = {
	content: 'inline*',
	attrs: { isHeader: { default: false } },
	isolating: true,
	code: true,

	toDOM: (node: Node) => [node.attrs.isHeader ? 'th' : 'td', 0],
	parseDOM: [{ tag: 'th', attrs: { isHeader: true } }, { tag: 'td', attrs: { isHeader: false } }],
} as NodeSpec;
