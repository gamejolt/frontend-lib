import { strike } from 'game-jolt-frontend-lib/components/content/content-editor/schemas/specs/marks/strike-nodespec';
import { embed } from 'game-jolt-frontend-lib/components/content/content-editor/schemas/specs/nodes/embed-nodespec';
import { img } from 'game-jolt-frontend-lib/components/content/content-editor/schemas/specs/nodes/img-nodespec';
import { paragraph } from 'game-jolt-frontend-lib/components/content/content-editor/schemas/specs/nodes/paragraph-nodespec';
import { Schema } from 'prosemirror-model';
import { schema as basicSchema } from 'prosemirror-schema-basic';
import { gjEmoji } from './specs/nodes/gj-emoji-nodespec';
import { hardBreak } from './specs/nodes/hard-bread-nodespec';

export const firesidePostArticleSchema = new Schema({
	nodes: {
		text: {
			group: 'inline',
		},
		paragraph,
		img,
		embed,
		hardBreak,
		gjEmoji,
		doc: {
			content: 'block+',
		},
	},
	marks: {
		strong: basicSchema.marks.strong.spec,
		em: basicSchema.marks.em.spec,
		code: basicSchema.marks.code.spec,
		link: basicSchema.marks.link.spec,
		strike,
	},
});
