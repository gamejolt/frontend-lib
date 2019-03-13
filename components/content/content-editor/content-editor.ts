import View from '!view!./content-editor.html?style=./content-editor.styl';
import { AppContentEditorTextControls } from 'game-jolt-frontend-lib/components/content/content-editor/controls/text/text-controls';
import { pasteEventHandler } from 'game-jolt-frontend-lib/components/content/content-editor/events/paste-event-handler';
import { createPlugins } from 'game-jolt-frontend-lib/components/content/content-editor/plugins/plugins';
import { generateSchema } from 'game-jolt-frontend-lib/components/content/content-editor/schemas/content-editor-schema';
import { DOMParser } from 'prosemirror-model';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import 'prosemirror-view/style/prosemirror.css';
import { ResizeObserver } from 'resize-observer';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { ProsemirrorEditorFormat } from '../adapter/definitions';
import { GJContentFormatAdapter } from '../adapter/gj-content-format-adapter';
import { ContentContext, ContextCapabilities } from '../content-context';
import { ContentHydrator } from '../content-hydrator';
import { ContentOwner } from '../content-owner';
import { AppContentViewer } from '../content-viewer/content-viewer';
import { AppContentEditorControls } from './controls/content-editor-controls';
import { AppContentEditorEmojiControls } from './controls/emoji/emoji-controls';
import { dropEventHandler } from './events/drop-event-handler';
import { buildNodeViews } from './node-views/node-view-builder';

@View
@Component({
	components: {
		AppContentEditorControls,
		AppContentEditorTextControls,
		AppContentEditorEmojiControls,
		AppContentViewer,
	},
})
export class AppContentEditor extends Vue implements ContentOwner {
	@Prop(String)
	contentContext!: ContentContext;

	state!: EditorState;
	view: EditorView | null = null;
	stateCounter = 0;
	capabilities: ContextCapabilities = ContextCapabilities.getEmpty();
	emojiPanelVisible = false;
	hydrator: ContentHydrator = new ContentHydrator();

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
		return this.capabilities.gjEmoji && this.emojiPanelVisible;
	}

	// DEBUG
	get viewerSource() {
		if (this.view) {
			const data = GJContentFormatAdapter.adaptOut(
				this.view.state.doc.toJSON() as ProsemirrorEditorFormat,
				this.contentContext
			);

			if (this.hydrator) {
				data.hydration = this.hydrator.hydration;
			}

			return JSON.stringify(data);
		}
	}

	getContext() {
		return this.contentContext;
	}

	getHydrator() {
		return this.hydrator;
	}

	getCapabilities() {
		return this.capabilities;
	}

	mounted() {
		this.capabilities = ContextCapabilities.getForContext(this.contentContext);
		this.hydrator = new ContentHydrator();

		const schema = generateSchema(this.capabilities);
		const plugins = createPlugins(this, schema);
		this.state = EditorState.create({
			doc: DOMParser.fromSchema(schema).parse(this.$refs.doc),
			plugins,
		});

		const nodeViews = buildNodeViews(this);
		this.view = new EditorView(this.$refs.doc, {
			state: this.state,
			nodeViews,
			handleDOMEvents: {
				paste: pasteEventHandler,
				drop: dropEventHandler,
			},
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
