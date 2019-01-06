import View from '!view!./content-editor.html?style=./content-editor.styl';
import { AppContentEditorTextControls } from 'game-jolt-frontend-lib/components/content/content-editor/controls/text/content-editor-text-controls';
import { getContentEditorKeymap } from 'game-jolt-frontend-lib/components/content/content-editor/keymap';
import { EmbedNodeView } from 'game-jolt-frontend-lib/components/content/content-editor/node-views/embed';
import { firesidePostArticleSchema } from 'game-jolt-frontend-lib/components/content/content-editor/schemas/fireside-post-article-schema';
import { baseKeymap } from 'prosemirror-commands';
import { history } from 'prosemirror-history';
import { keymap } from 'prosemirror-keymap';
import { DOMParser, Node } from 'prosemirror-model';
import { EditorState, Plugin } from 'prosemirror-state';
import { Decoration, EditorView, NodeView } from 'prosemirror-view';
import 'prosemirror-view/style/prosemirror.css';
import { ResizeObserver } from 'resize-observer';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { ContentContext, ContextCapabilities } from '../content-context';
import { AppContentEditorControls } from './controls/content-editor-controls';
import { ImgNodeView } from './node-views/img';
import { UpdateIncrementerPlugin } from './plugins/update-incrementer-plugin';

type NodeViewList = {
	[name: string]: (
		node: Node,
		view: EditorView<any>,
		getPos: () => number,
		decorations: Decoration[]
	) => NodeView<any>;
};

@View
@Component({
	components: {
		AppContentEditorControls,
		AppContentEditorTextControls,
	},
})
export class AppContentEditor extends Vue {
	@Prop(String)
	contentContext!: ContentContext;

	state!: EditorState;
	view: EditorView | null = null;
	stateCounter = 0;
	capabilities: ContextCapabilities = ContextCapabilities.getEmpty();

	$refs!: {
		doc: HTMLElement;
	};

	get shouldShowControls() {
		return this.capabilities.hasAny;
	}

	get shouldShowTextControls() {
		return this.capabilities.hasAnyText;
	}

	mounted() {
		this.capabilities = ContextCapabilities.getForContext(this.contentContext);

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
		const ourKeymap = getContentEditorKeymap(schema);
		this.state = EditorState.create({
			doc: DOMParser.fromSchema(schema).parse(this.$refs.doc),
			plugins: [keymap(ourKeymap), keymap(baseKeymap), history(), incrementerPlugin],
		});

		// Construct node views based on capabilities
		const nodeViews = {} as NodeViewList;
		if (this.capabilities.embedVideo) {
			nodeViews.embed = function(node, view, getPos) {
				return new EmbedNodeView(node, view, getPos);
			};
		}
		if (this.capabilities.image) {
			nodeViews.img = function(node, view, getPos) {
				return new ImgNodeView(node, view, getPos);
			};
		}

		this.view = new EditorView(this.$refs.doc, {
			state: this.state,
			nodeViews,
		});

		// Observe any resize events so the editor controls can be repositioned correctly
		const ro = new ResizeObserver(() => {
			this.stateCounter++;
		});
		ro.observe(this.$refs.doc);

		this.stateCounter++;
	}

	private getSchemaForContext() {
		switch (this.contentContext) {
			case 'fireside-post-article':
				return firesidePostArticleSchema;
		}
		throw new Error('Not supported content context ' + this.contentContext);
	}
}
