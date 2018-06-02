import { ContentEditorNode } from './node/index';
import { ContentEditorNodeParagraphModel } from './node/paragraph.model';
import { ContentEditorNodeHeadingModel } from './node/heading.model';
import { ContentEditorSpan } from './span/index';
import { ContentEditorSpanItalic } from './span/italic';
import { ContentEditorSpanBold } from './span/bold';
import { ContentEditorSpanLink } from './span/link';

export class DomParser {}

export function parseDomToNodes(domNodes: NodeList) {
	const nodes: ContentEditorNode[] = [];

	for (let i = 0; i < domNodes.length; ++i) {
		const domNode = domNodes[i];
		console.log('found dom node', domNode);
		if (domNode.nodeType === Node.ELEMENT_NODE) {
			let { content, spans } = parseSpans(domNode.childNodes, 0);
			spans = mergeIntersectingSpans(spans);
			console.log('merged spans', spans);

			if (domNode.nodeName.toLowerCase() === 'p') {
				nodes.push(new ContentEditorNodeParagraphModel(content, spans));
			} else if (domNode.nodeName.toLowerCase() === 'h1') {
				nodes.push(new ContentEditorNodeHeadingModel(content, spans));
			}
		}
	}

	return nodes;
}

function parseSpans(domNodes: NodeList, index: number) {
	let content = '';
	let spans: ContentEditorSpan[] = [];

	for (let i = 0; i < domNodes.length; ++i) {
		const domNode = domNodes[i];
		if (domNode.nodeType === Node.TEXT_NODE) {
			const newContent = domNode.textContent || '';
			content += newContent;
			index += newContent.length;
		} else if (domNode.nodeType === Node.ELEMENT_NODE) {
			const spanStart = index;
			const { content: newContent, spans: newSpans } = parseSpans(domNode.childNodes, index);
			content += newContent;
			index += newContent.length;

			const span = makeSpan(domNode, spanStart, index);
			if (span) {
				spans.push(span);
			}
			spans = spans.concat(newSpans);
		}
	}

	return { content, spans };
}

function makeSpan(domNode: Node, start: number, end: number) {
	if (['em', 'i'].indexOf(domNode.nodeName.toLowerCase()) !== -1) {
		return new ContentEditorSpanItalic(start, end);
	} else if (['strong', 'b'].indexOf(domNode.nodeName.toLowerCase()) !== -1) {
		return new ContentEditorSpanBold(start, end);
	} else if (['a'].indexOf(domNode.nodeName.toLowerCase()) !== -1) {
		return new ContentEditorSpanLink(start, end, '');
	}

	console.warn(`Ignoring dom node.`, domNode);
}

function mergeIntersectingSpans(spans: ContentEditorSpan[]) {
	for (let i = 0; i < spans.length; ++i) {
		const a = spans[i];
		for (const b of spans) {
			if (a !== b && a.start <= b.end && a.end >= b.start && a.tag === b.tag) {
				spans.splice(i, 1);
				b.start = Math.min(a.start, b.start);
				b.end = Math.max(a.end, b.end);
			}
		}
	}

	return spans;
}
