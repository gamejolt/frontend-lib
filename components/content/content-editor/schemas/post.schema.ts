import { Schema } from 'prosemirror-model';
import { schema as basicSchema } from 'prosemirror-schema-basic';
import { img } from './specs/img.nodespec';
import { paragraph } from './specs/paragraph.nodespec';
import { video } from './specs/video.nodespec';

export const postSchema = new Schema({
	nodes: {
		text: {},
		paragraph,
		img,
		video,
		doc: {
			content: 'block+',
		},
	},
	marks: basicSchema.spec.marks,
});
