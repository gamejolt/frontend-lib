import { img } from 'game-jolt-frontend-lib/components/content/content-editor/schemas/specs/img-nodespec';
import { paragraph } from 'game-jolt-frontend-lib/components/content/content-editor/schemas/specs/paragraph-nodespec';
import { Schema } from 'prosemirror-model';
import { schema as basicSchema } from 'prosemirror-schema-basic';
import { embed } from './specs/embed-nodespec';

export const firesidePostArticleSchema = new Schema({
	nodes: {
		text: {},
		paragraph,
		img,
		embed,
		doc: {
			content: 'block+',
		},
	},
	marks: basicSchema.spec.marks,
});
