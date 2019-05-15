import { Mark, MarkSpec } from 'prosemirror-model';

export const link = {
	attrs: {
		href: {},
		title: { default: null },
		autolink: { default: false },
	},
	inclusive: false,
	toDOM(mark: Mark, _inline: boolean) {
		let { href, title, autolink } = mark.attrs;
		return ['a', { href, title, 'data-autolink': autolink }, 0];
	},
	parseDOM: [
		{
			tag: 'a[href]',
			getAttrs(domNode: Element) {
				return {
					href: domNode.getAttribute('href'),
					title: domNode.getAttribute('title'),
					autolink: domNode.getAttribute('data-autolink'),
				};
			},
		},
	],
} as MarkSpec;
