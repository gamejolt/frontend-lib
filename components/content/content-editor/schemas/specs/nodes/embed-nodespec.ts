import { Node, NodeSpec } from 'prosemirror-model';

export const embed = {
	group: 'block',
	marks: '',
	draggable: true,
	selectable: true,
	attrs: {
		embedType: {
			default: 'youtube-video',
		},
		embedSource: {
			default: 'WfDS_2omcHw',
		},
	},
	toDOM: (node: Node) => [
		'div',
		{
			'embed-type': node.attrs.embedType,
			'embed-source': node.attrs.embedSource,
		},
	],
	parseDOM: [
		{
			tag: 'div[embed-type]',
			getAttrs: (domNode: Element) => {
				return {
					embedType: domNode.getAttribute('embed-type'),
					embedSource: domNode.getAttribute('embed-source'),
				};
			},
		},
	],
} as NodeSpec;
