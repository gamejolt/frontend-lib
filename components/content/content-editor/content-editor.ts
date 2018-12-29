import View from '!view!./content-editor.html?style=./content-editor.styl';
import { UpdateIncrementerPlugin } from 'game-jolt-frontend-lib/components/content/content-editor/plugins/update-incrementer.plugin';
import { baseKeymap, toggleMark } from 'prosemirror-commands';
import { history, redo, undo } from 'prosemirror-history';
import { keymap } from 'prosemirror-keymap';
import { DOMParser } from 'prosemirror-model';
import { schema as basicSchema } from 'prosemirror-schema-basic';
import { EditorState, Plugin } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import 'prosemirror-view/style/prosemirror.css';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { ContentContext } from '../content-context';
import { AppContentEditorControls } from './controls/content-editor-controls';
import { VideoView } from './node-views/video';
import { postSchema } from './schemas/post.schema';

const isMac = typeof navigator != 'undefined' ? /Mac/.test(navigator.platform) : false;

const ourKeymap: { [k: string]: any } = {
	'Mod-z': undo,
	'Shift-Mod-z': redo,
	'Mod-b': toggleMark(basicSchema.marks.strong),
	'Mod-i': toggleMark(basicSchema.marks.em),
	'Mod-`': toggleMark(basicSchema.marks.code),
};

if (!isMac) {
	ourKeymap['Mod-y'] = redo;
}

@View
@Component({
	components: {
		AppContentEditorControls,
	},
})
export class AppContentEditor extends Vue {
	@Prop(String)
	contentContext!: ContentContext;

	state!: EditorState;
	view: EditorView | null = null;
	stateCounter = 0;

	$refs!: {
		doc: HTMLElement;
	};

	mounted() {
		// This is used to update any children with the new view.
		// We don't want to watch the view/state objects because they are too heavy.
		// So instead, this increments a counter every time the state changes
		const that = this;
		const incrementerPlugin = new Plugin({
			view(editorView) {
				return new UpdateIncrementerPlugin(editorView, that);
			},
		});

		const schema = this.getSchemaForContext();
		this.state = EditorState.create({
			doc: DOMParser.fromSchema(schema).parse(this.$refs.doc),
			plugins: [keymap(ourKeymap), keymap(baseKeymap), history(), incrementerPlugin],
		});

		this.view = new EditorView(this.$refs.doc, {
			state: this.state,
			nodeViews: {
				video(node, view, getPos) {
					return new VideoView(node, view, getPos);
				},
			},
		});
		this.stateCounter++;
	}

	private getSchemaForContext() {
		switch (this.contentContext) {
			case 'fireside-post':
				return postSchema;
		}
		throw new Error('Not supported content context ' + this.contentContext);
	}
}
