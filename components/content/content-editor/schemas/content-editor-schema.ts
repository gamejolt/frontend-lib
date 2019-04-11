import { Schema } from 'prosemirror-model';
import { schema as basicSchema } from 'prosemirror-schema-basic';
import { ContextCapabilities } from '../../content-context';
import { ContentObjectType } from '../../content-object';
import { strike } from './specs/marks/strike-markspec';
import { blockquote } from './specs/nodes/blockquote-nodespec';
import { bulletList } from './specs/nodes/bullet-list-nodespec';
import { codeBlock } from './specs/nodes/code-block-nodespec';
import { embed } from './specs/nodes/embed-nodespec';
import { gjEmoji } from './specs/nodes/gj-emoji-nodespec';
import { hardBreak } from './specs/nodes/hard-break-nodespec';
import { heading } from './specs/nodes/heading-nodespec';
import { hr } from './specs/nodes/hr-nodespec';
import { listItem } from './specs/nodes/list-item-nodespec';
import { mediaItem } from './specs/nodes/media-item-nodespec';
import { mediaUpload } from './specs/nodes/media-upload-nodespec';
import { mention } from './specs/nodes/mention-nodespec';
import { orderedList } from './specs/nodes/ordered-list-nodespec';
import { paragraph } from './specs/nodes/paragraph-nodespec';
import { spoiler } from './specs/nodes/spoiler-nodespec';
import { tableCell } from './specs/nodes/table-cell-nodespec';
import { table } from './specs/nodes/table-nodespec';
import { tableRow } from './specs/nodes/table-row-nodespec';
import { tag } from './specs/nodes/tag-nodespec';

export function generateSchema(capabilities: ContextCapabilities) {
	return new Schema({
		nodes: generateNodes(capabilities),
		marks: generateMarks(capabilities),
	});
}

function generateNodes(capabilities: ContextCapabilities) {
	const nodes = {
		text: {
			group: 'inline',
		},
		paragraph,
		hardBreak,
		doc: {
			content: 'block*',
		},
	} as any;

	const allowedDocNodes = ['paragraph'] as ContentObjectType[];

	if (capabilities.gjEmoji) {
		nodes.gjEmoji = gjEmoji;
	}
	if (capabilities.media) {
		nodes.mediaItem = mediaItem;
		nodes.mediaUpload = mediaUpload;
	}
	if (capabilities.embedMusic || capabilities.embedVideo) {
		nodes.embed = embed;
	}
	if (capabilities.codeBlock) {
		nodes.codeBlock = codeBlock;
	}
	if (capabilities.blockquote) {
		nodes.blockquote = blockquote;
	}
	if (capabilities.lists) {
		nodes.listItem = listItem;
		nodes.bulletList = bulletList;
		nodes.orderedList = orderedList;

		allowedDocNodes.push('bulletList', 'orderedList');
	}
	if (capabilities.hr) {
		nodes.hr = hr;
	}
	if (capabilities.spoiler) {
		nodes.spoiler = spoiler;

		allowedDocNodes.push('spoiler');
	}
	if (capabilities.table) {
		nodes.table = table;
		nodes.tableRow = tableRow;
		nodes.tableCell = tableCell;
	}
	if (capabilities.heading) {
		nodes.heading = heading;

		allowedDocNodes.push('heading');
	}
	if (capabilities.tag) {
		nodes.tag = tag;
	}
	if (capabilities.mention) {
		nodes.mention = mention;
	}

	if (allowedDocNodes.length > 0) {
		nodes.doc.content += ' (' + allowedDocNodes.join(' | ') + ')';
	}

	return nodes;
}

function generateMarks(capabilities: ContextCapabilities) {
	const marks = {} as any;

	if (capabilities.textBold) {
		marks.strong = basicSchema.marks.strong.spec;
	}
	if (capabilities.textItalics) {
		marks.em = basicSchema.marks.em.spec;
	}
	if (capabilities.textCode) {
		marks.code = basicSchema.marks.code.spec;
	}
	if (capabilities.textLink) {
		marks.link = basicSchema.marks.link.spec;
	}
	if (capabilities.textStrike) {
		marks.strike = strike;
	}

	return marks;
}
