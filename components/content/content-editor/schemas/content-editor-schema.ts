import { strike } from 'game-jolt-frontend-lib/components/content/content-editor/schemas/specs/marks/strike-nodespec';
import { blockquote } from 'game-jolt-frontend-lib/components/content/content-editor/schemas/specs/nodes/blockquote-nodespec';
import { embed } from 'game-jolt-frontend-lib/components/content/content-editor/schemas/specs/nodes/embed-nodespec';
import { mediaUpload } from 'game-jolt-frontend-lib/components/content/content-editor/schemas/specs/nodes/media-upload-nodespec';
import { Schema } from 'prosemirror-model';
import { schema as basicSchema } from 'prosemirror-schema-basic';
import { ContextCapabilities } from '../../content-context';
import { codeBlock } from './specs/nodes/code-block-nodespec';
import { gjEmoji } from './specs/nodes/gj-emoji-nodespec';
import { hardBreak } from './specs/nodes/hard-bread-nodespec';
import { mediaItem } from './specs/nodes/media-item-nodespec';
import { paragraph } from './specs/nodes/paragraph-nodespec';

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
		gjEmoji,
		mediaUpload, // TODO: move
		doc: {
			content: 'block* paragraph',
		},
	} as any;

	if (capabilities.media) {
		nodes.mediaItem = mediaItem;
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
