import { Node, Schema } from 'prosemirror-model';
import { schema as basicSchema } from 'prosemirror-schema-basic';

export const mainSchema = new Schema({
	nodes: {
		text: {},
		paragraph: {
			group: 'block',
			content: 'text*',
			toDOM: (node: Node) => ['p', 0],
			parseDOM: [{ tag: 'p' }],
		},
		img: {
			group: 'block',
			marks: '',
			draggable: false,
			attrs: {
				src: {
					default: 'https://m.gjcdn.net/fireside-post-image/700/1532101-hk2qzijv-v3.jpg',
				},
			},
			toDOM: (node: Node) => [
				'img',
				{
					src: node.attrs.src,
				},
			],
			parseDOM: [
				{
					tag: 'img',
					getAttrs: (domNode: Element) => {
						return domNode.getAttribute('src');
					},
				},
			],
		},
		video: {
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
			toDOM: (node: Node) => ['div'],
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
		},
		doc: {
			content: 'block+',
		},
	},
	marks: basicSchema.spec.marks,
} as any);
