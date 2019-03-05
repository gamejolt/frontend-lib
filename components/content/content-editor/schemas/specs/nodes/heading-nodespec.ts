import { Node, NodeSpec } from 'prosemirror-model';

export const heading = {
	attrs: { level: { default: 1 } },
	group: 'block',
	content: 'paragraph+',
	defining: true,
	marks: '',

	toDOM: (node: Node) => ['h' + node.attrs.level, { class: 'content-editor-heading' }, 0],
	parseDOM: [{ tag: 'h1', attrs: { level: 1 } }, { tag: 'h2', attrs: { level: 2 } }],
} as NodeSpec;
