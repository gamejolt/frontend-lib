import { Node, NodeSpec } from 'prosemirror-model';

export const video = {
	group: 'block',
	marks: '',
	draggable: false,
	attrs: {
		videoId: {
			default: 'WfDS_2omcHw',
		},
		videoProvider: {
			default: 'youtube',
		},
		thumbnail: {
			default: 'https://i.ytimg.com/vi/WfDS_2omcHw/hqdefault.jpg',
		},
	},
	toDOM: (_: Node) => ['div'],
	parseDOM: [
		{
			tag: 'div',
			getAttrs: (domNode: Element) => {
				return {
					videoId: domNode.getAttribute('videoId'),
					videoProvider: domNode.getAttribute('videoProvider'),
					thumbnail: domNode.getAttribute('thumbnail'),
				};
			},
		},
	],
} as NodeSpec;
