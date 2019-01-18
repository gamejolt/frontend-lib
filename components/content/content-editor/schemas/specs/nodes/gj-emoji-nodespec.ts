import { Node, NodeSpec } from 'prosemirror-model';

export const GJ_EMOJIS = [
	'sleeping',
	'bucktooth',
	'crossed',
	'crying',
	'dizzy',
	'grin',
	'guh',
	'huh',
	'innocent',
	'mah',
	'ninja',
	'ohyou',
	'omg',
	'ouch',
	'psychotic',
	'smile',
	'snooty',
	'tongue',
	'wha',
	'yush',
];

export const gjEmoji = {
	attrs: { type: { default: 'grin' } },
	group: 'inline',
	inline: true,
	draggable: true,
	selectable: true,
	marks: '',

	toDOM: (node: Node) => [
		'span',
		{
			'emoji-type': node.attrs.type,
			class: 'emoji emoji-' + node.attrs.type,
			title: ':' + node.attrs.type + ':',
		},
	],

	parseDOM: [
		{
			tag: 'span[emoji-type]',
			getAttrs: (domNode: Element) => {
				const type = domNode.getAttribute('emoji-type');
				return { type };
			},
		},
	],
} as NodeSpec;
