import { NodeSpec } from 'prosemirror-model';

export const hardBreak = {
	inline: true,
	group: 'inline',
	selectable: false,
	parseDOM: [{ tag: 'br' }],
	toDOM() {
		return ['br'];
	},
} as NodeSpec;
