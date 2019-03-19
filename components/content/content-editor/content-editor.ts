import View from '!view!./content-editor.html?style=./content-editor.styl';
import { ContentContainer } from 'game-jolt-frontend-lib/components/content/content-container';
import { AppContentEditorTextControls } from 'game-jolt-frontend-lib/components/content/content-editor/controls/text/text-controls';
import { pasteEventHandler } from 'game-jolt-frontend-lib/components/content/content-editor/events/paste-event-handler';
import { FocusWatcher } from 'game-jolt-frontend-lib/components/content/content-editor/focus-watcher';
import { createPlugins } from 'game-jolt-frontend-lib/components/content/content-editor/plugins/plugins';
import { generateSchema } from 'game-jolt-frontend-lib/components/content/content-editor/schemas/content-editor-schema';
import {
	ContentFormatAdapter,
	ProsemirrorEditorFormat,
} from 'game-jolt-frontend-lib/components/content/content-format-adapter';
import { DOMParser, Node, Schema } from 'prosemirror-model';
import { EditorState, Plugin } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import 'prosemirror-view/style/prosemirror.css';
import { ResizeObserver } from 'resize-observer';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { ContentContext, ContextCapabilities } from '../content-context';
import { ContentHydrator } from '../content-hydrator';
import { ContentOwner } from '../content-owner';
import { AppContentViewer } from '../content-viewer/content-viewer';
import { AppContentEditorControls } from './controls/content-editor-controls';
import { AppContentEditorEmojiControls } from './controls/emoji/emoji-controls';
import { dropEventHandler } from './events/drop-event-handler';
import { buildNodeViews } from './node-views/node-view-builder';

/**
 * @emits update
 */
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

	@Prop(Boolean)
	showViewer!: boolean;

	@Prop({ type: String, default: '' })
	placeholder!: string;

	state!: EditorState;
	view: EditorView | null = null;
	stateCounter = 0;
	capabilities: ContextCapabilities = ContextCapabilities.getEmpty();
	emojiPanelVisible = false;
	hydrator: ContentHydrator = new ContentHydrator();
	schema: Schema | null = null;
	plugins: Plugin[] | null = null;
	isFocused = false;
	focusWatcher: FocusWatcher | null = null;

	$refs!: {
		editor: HTMLElement;
		doc: HTMLElement;
	};

	get shouldShowControls() {
		return this.isFocused && this.capabilities.hasAny;
	}

	get shouldShowTextControls() {
		return this.isFocused && !this.shouldShowEmojiControls && this.capabilities.hasAnyText;
	}

	get shouldShowEmojiControls() {
		return this.isFocused && this.capabilities.gjEmoji && this.emojiPanelVisible;
	}

	get isEmpty() {
		if (this.view) {
			return this.view.state.doc.toString().trim() === 'doc(paragraph)';
		}
		return false;
	}

	get shouldShowPlaceholder() {
		return this.placeholder.length > 0 && this.isEmpty;
	}

	// DEBUG
	get viewerSource() {
		if (this.view) {
			const data = ContentFormatAdapter.adaptOut(
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

		this.schema = generateSchema(this.capabilities);
		this.plugins = createPlugins(this, this.schema);
		this.state = EditorState.create({
			doc: DOMParser.fromSchema(this.schema).parse(this.$refs.doc),
			schema: this.schema,
			plugins: this.plugins,
		});

		this.updateView();

		// Observe any resize events so the editor controls can be repositioned correctly
		const ro = new ResizeObserver(() => {
			this.stateCounter++;
		});
		ro.observe(this.$refs.doc);

		this.stateCounter++;

		this.focusWatcher = new FocusWatcher(this.$refs.editor, this.onFocusIn, this.onFocusOut);
		this.focusWatcher.start();
	}

	beforeDestroy() {
		if (this.focusWatcher instanceof FocusWatcher) {
			this.focusWatcher!.destroy();
		}
	}

	private updateView() {
		if (this.view) {
			this.view.destroy();
		}

		const nodeViews = buildNodeViews(this);
		this.view = new EditorView(this.$refs.doc, {
			state: this.state,
			nodeViews,
			handleDOMEvents: {
				paste: pasteEventHandler,
				drop: dropEventHandler,
			},
		});
	}

	onEmojisHide() {
		this.emojiPanelVisible = false;
	}

	public getContent() {
		if (this.view) {
			const data = ContentFormatAdapter.adaptOut(
				this.view.state.doc.toJSON() as ProsemirrorEditorFormat,
				this.contentContext
			);
			return data;
		}
		return null;
	}

	public setContent(container: ContentContainer) {
		if (container.context !== this.contentContext) {
			throw new Error('The passed in content context is invalid.');
		}
		if (this.schema) {
			const jsonObj = ContentFormatAdapter.adaptIn(container);
			this.state = EditorState.create({
				doc: Node.fromJSON(this.schema, jsonObj),
				schema: this.schema,
				plugins: this.plugins,
			});
			this.updateView();
		}
	}

	public onFocus() {
		// Focus the content editable when the outer doc gets focused.
		const child = this.$refs.doc.firstChild;
		if (child instanceof HTMLElement) {
			child.focus();
		}
	}

	private onFocusIn() {
		this.isFocused = true;
	}

	private onFocusOut() {
		this.isFocused = false;
	}
}
