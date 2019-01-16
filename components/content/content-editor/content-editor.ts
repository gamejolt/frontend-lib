import View from '!view!./content-editor.html?style=./content-editor.styl';
import { AppContentEditorTextControls } from 'game-jolt-frontend-lib/components/content/content-editor/controls/text/text-controls';
import { getContentEditorKeymap } from 'game-jolt-frontend-lib/components/content/content-editor/keymap';
import { EmbedNodeView } from 'game-jolt-frontend-lib/components/content/content-editor/node-views/embed';
import { generateSchema } from 'game-jolt-frontend-lib/components/content/content-editor/schemas/content-editor-schema';
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
import { AppContentEditorEmojiControls } from './controls/emoji/emoji-controls';
import { ImgNodeView } from './node-views/img';
import { ShowEmojiPanelPlugin } from './plugins/show-emoji-panel-plugin';
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
		AppContentEditorEmojiControls,
	},
})
export class AppContentEditor extends Vue {
	@Prop(String)
	contentContext!: ContentContext;

	state!: EditorState;
	view: EditorView | null = null;
	stateCounter = 0;
	capabilities: ContextCapabilities = ContextCapabilities.getEmpty();
	emojiPanelVisible = false;

	$refs!: {
		doc: HTMLElement;
	};

	get shouldShowControls() {
		return this.capabilities.hasAny;
	}

	get shouldShowTextControls() {
		return !this.shouldShowEmojiControls && this.capabilities.hasAnyText;
	}

	get shouldShowEmojiControls() {
		return this.emojiPanelVisible;
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
		const emojiPanelPlugin = new Plugin({
			view(editorView) {
				return new ShowEmojiPanelPlugin(editorView, that);
			},
		});

		const schema = generateSchema(this.capabilities);
		const ourKeymap = getContentEditorKeymap(this, schema);
		this.state = EditorState.create({
			doc: DOMParser.fromSchema(schema).parse(this.$refs.doc),
			plugins: [
				keymap(ourKeymap),
				keymap(baseKeymap),
				history(),
				incrementerPlugin,
				// emojiPanelPlugin,
			],
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

	onEmojisHide() {
		this.emojiPanelVisible = false;
	}
}
