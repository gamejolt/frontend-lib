import { VNode, CreateElement } from 'vue';
import { ContentEditorSpan } from '../span/index';
import { ContentEditorMarker } from '../marker';
import { ContentEditorNode } from './index';

export abstract class ContentEditorNodeContent extends ContentEditorNode {
	constructor(public content: string, public spans: ContentEditorSpan[]) {
		super();
	}

	get markers() {
		return createMarkersFromSpans(this.spans);
	}

	render(h: CreateElement) {
		return renderContentNode(this, h);
	}
}

/**
 * Flattens the spans into markers on the content "timeline". Markers are single positions, rather
 * than a start/end.
 */
export function createMarkersFromSpans(spans: ContentEditorSpan[]) {
	let markers: ContentEditorMarker[] = [];
	const endMarkerMap = new Map<number, number>();

	for (const span of spans) {
		markers.push(new ContentEditorMarker(span.start, span));

		// We only store one "end" marker per position. If there is a collision with another end
		// marker, one of them will take precedence. If the start of the new span is less than the
		// currently stored one, that means that tIthe stored marker will be closed automatically by
		// the new span and we can replace it. If they have the same start positions, then the span
		// with the higher priority overrides. Since we sort the markers by their start
		// pos/priority, it means that higher priority spans will get marked first and lower
		// priority ones will get automatically closed when the stack is popped.
		let shouldAddEnd = false;
		const index = endMarkerMap.get(span.end);
		if (index === undefined) {
			shouldAddEnd = true;
		} else {
			const marker = markers[index]!;
			if (
				span.start < marker.span.start ||
				(span.start === marker.span.start && span.priority > marker.span.priority)
			) {
				// Remove the current end marker.
				markers.splice(index, 1);
				shouldAddEnd = true;
			}
		}

		if (shouldAddEnd) {
			markers.push(new ContentEditorMarker(span.end, span));
			endMarkerMap.set(span.end, markers.length - 1);
		}
	}

	return markers.sort((a, b) => {
		// If same marker pos, sort by span priority next. This way they will always get rendered in
		// the same exact order, no matter the way the model data is stored.
		if (a.pos === b.pos) {
			return b.span.priority - a.span.priority;
		}
		return a.pos - b.pos;
	});
}

/**
 * Create VNode data for the node passed in.
 */
export function renderContentNode(node: ContentEditorNodeContent, h: CreateElement) {
	// The index is the current position in the node text content.
	let index = 0;

	// Parent children are the top-level children that get stored. Nested children go into the
	// stack.
	const parentChildren: Node[] = [];

	// We push onto the stack when new start markers are hit, and pop off when end markers are hit.
	// This allows us to push text content into the correct vnodes.
	const stack: {
		marker: ContentEditorMarker;
		children: Node[];
	}[] = [];

	// Depending on if there are items on the stack, we may push child content into the top item of
	// the stack, or into the top-level children list.
	const addContent = (el: Node | string) => {
		if (el === '') {
			return;
		}

		if (typeof el === 'string') {
			el = document.createTextNode(el);
		}

		if (stack.length > 0) {
			stack[stack.length - 1].children.push(el);
		} else {
			parentChildren.push(el);
		}
	};

	// When we pop the stack (hit an end marker), we need to create a vnode containing the nested
	// child content that we have generated for the item. We create the new vnode and push it into
	// the children of the next item in the stack.
	const popStack = () => {
		const top = stack.pop()!;
		const el = document.createElement(top.marker.span.tag);
		for (const child of top.children) {
			el.appendChild(child);
		}
		addContent(el);
		return top;
	};

	for (const marker of node.markers) {
		// This is where we collect the text content into the current vnode up until this marker.
		addContent(node.content.substring(index, marker.pos));
		index = marker.pos;

		// If this is a start marker, we just push into the stack. We don't create vnodes or
		// anything until we hit an end marker.
		if (marker.isStart) {
			stack.push({
				marker,
				children: [],
			});
			continue;
		}

		// If we hit an end marker, then we need to pop the stack until we have closed all the inner
		// elements that were started after the marker we're closing. We collect any markers that we
		// need to start again that aren't supposed to be closed yet. For example if our markers
		// look something like: `<b>test <i>this</b> out</i>`, we need to close the `i` but then
		// start it again right after closing out the `b` tag.
		const reopen: ContentEditorMarker[] = [];
		while (stack.length > 0 && marker.span.tag !== stack[stack.length - 1].marker.span.tag) {
			const top = popStack();

			// Only re-open the marker if its span wasn't going to end at this position.
			if (top.marker.span.end !== marker.pos) {
				reopen.push(top.marker);
			}
		}

		// The above loop doesn't actually pop the marker that needs to close since it only loops
		// until the tag gets hit. This just makes sure to pop it off.
		popStack();

		for (const i of reopen) {
			stack.push({
				// Re-open the marker, but set the start index to the current position.
				marker: new ContentEditorMarker(index, i.span),
				children: [],
			});
		}
	}

	// After processing all markers we may have some extra content at the end that wasn't contained
	// in a span. Just add it in.
	if (index !== node.content.length) {
		addContent(node.content.substring(index));
	}

	// Browsers seem to add in <br>s at the end of block level elements for contenteditable for some
	// reason. May as well just be consistent and always add it in.
	addContent(document.createElement('br'));

	const parent = document.createElement('div');
	for (const child of parentChildren) {
		parent.appendChild(child);
	}

	return h(node.tag, {
		domProps: {
			innerHTML: parent.innerHTML,
		},
	});
}
