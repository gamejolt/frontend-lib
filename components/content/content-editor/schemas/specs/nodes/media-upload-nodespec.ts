import { Node, NodeSpec } from 'prosemirror-model';

// When an <img> tag gets pasted into the editor, this node handles the upload to a Media Item
// It will be replaced with a media item node after the upload is complete
export const mediaUpload = {
	group: 'block',
	attrs: {
		src: {},
	},
	toDOM: (node: Node) => ['div', node.attrs],
	parseDOM: [
		{
			tag: 'img[src]',
			getAttrs: (domNode: Element) => {
				return {
					src: domNode.getAttribute('src'),
				};
			},
		},
	],
} as NodeSpec;
