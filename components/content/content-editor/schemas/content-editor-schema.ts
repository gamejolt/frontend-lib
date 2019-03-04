import { GJContentObjectType } from 'game-jolt-frontend-lib/components/content/adapter/definitions';
import { strike } from 'game-jolt-frontend-lib/components/content/content-editor/schemas/specs/marks/strike-markspec';
import { blockquote } from 'game-jolt-frontend-lib/components/content/content-editor/schemas/specs/nodes/blockquote-nodespec';
import { embed } from 'game-jolt-frontend-lib/components/content/content-editor/schemas/specs/nodes/embed-nodespec';
import { hardBreak } from 'game-jolt-frontend-lib/components/content/content-editor/schemas/specs/nodes/hard-break-nodespec';
import { mediaUpload } from 'game-jolt-frontend-lib/components/content/content-editor/schemas/specs/nodes/media-upload-nodespec';
import { orderedList } from 'game-jolt-frontend-lib/components/content/content-editor/schemas/specs/nodes/ordered-list-nodespec';
import { spoiler } from 'game-jolt-frontend-lib/components/content/content-editor/schemas/specs/nodes/spoiler-nodespec';
import { table } from 'game-jolt-frontend-lib/components/content/content-editor/schemas/specs/nodes/table-nodespec';
import { tag } from 'game-jolt-frontend-lib/components/content/content-editor/schemas/specs/nodes/tag-nodespec';
import { Schema } from 'prosemirror-model';
import { schema as basicSchema } from 'prosemirror-schema-basic';
import { ContextCapabilities } from '../../content-context';
import { bulletList } from './specs/nodes/bullet-list-nodespec';
import { codeBlock } from './specs/nodes/code-block-nodespec';
import { gjEmoji } from './specs/nodes/gj-emoji-nodespec';
import { hr } from './specs/nodes/hr-nodespec';
import { listItem } from './specs/nodes/list-item-nodespec';
import { mediaItem } from './specs/nodes/media-item-nodespec';
import { paragraph } from './specs/nodes/paragraph-nodespec';
import { tableCell } from './specs/nodes/table-cell-nodespec';
import { tableRow } from './specs/nodes/table-row-nodespec';

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

	const allowedDocNodes = ['paragraph'] as GJContentObjectType[];

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

	nodes.tag = tag;

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
