import { Node, NodeSpec } from 'prosemirror-model';

// When an <img> tag gets pasted into the editor, this node handles the upload to a Media Item
// It will be replaced with a media item node after the upload is complete
export const mediaUpload = {
	group: 'block',
	attrs: {
		src: {},
		uploadId: {},
	},
	toDOM: (node: Node) => ['div', { src: node.attrs.src, uploadId: node.attrs.uploadId }],
	parseDOM: [
		{
			tag: 'img[src]',
			getAttrs: (domNode: Element) => {
				return {
					src: domNode.getAttribute('src'),
					uploadId: domNode.getAttribute('uploadId'),
				};
			},
		},
	],
} as NodeSpec;
