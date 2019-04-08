import View from '!view!./content-editor.html?style=./content-editor.styl';
import { ContentContainer } from 'game-jolt-frontend-lib/components/content/content-container';
import { ContentEditorService } from 'game-jolt-frontend-lib/components/content/content-editor/content-editor.service';
import { AppContentEditorControlsEmojiPanel } from 'game-jolt-frontend-lib/components/content/content-editor/controls/emoji/panel/panel';
import { AppContentEditorTextControls } from 'game-jolt-frontend-lib/components/content/content-editor/controls/text/text-controls';
import buildEvents from 'game-jolt-frontend-lib/components/content/content-editor/events/build-events';
import { FocusWatcher } from 'game-jolt-frontend-lib/components/content/content-editor/focus-watcher';
import { createPlugins } from 'game-jolt-frontend-lib/components/content/content-editor/plugins/plugins';
import { generateSchema } from 'game-jolt-frontend-lib/components/content/content-editor/schemas/content-editor-schema';
import {
	ContentFormatAdapter,
	ProsemirrorEditorFormat,
} from 'game-jolt-frontend-lib/components/content/content-format-adapter';
import { Screen } from 'game-jolt-frontend-lib/components/screen/screen-service';
import { DOMParser, Node, Schema } from 'prosemirror-model';
import { EditorState, Plugin, Transaction } from 'prosemirror-state';
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
		AppContentEditorControlsEmojiPanel,
	},
})
export class AppContentEditor extends Vue implements ContentOwner {
	@Prop(String)
	contentContext!: ContentContext;

	@Prop(Boolean)
	showViewer!: boolean;

	@Prop({ type: String, default: '' })
	placeholder!: string;

	@Prop(Boolean)
	autofocus!: boolean;

	@Prop({ type: Boolean, default: false })
	disabled!: boolean;

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
		return !this.disabled && this.isFocused && this.capabilities.hasAny;
	}

	get shouldShowTextControls() {
		return (
			!this.disabled &&
			this.isFocused &&
			!this.shouldShowEmojiControls &&
			this.capabilities.hasAnyText
		);
	}

	get shouldShowEmojiPanel() {
		return !this.disabled && this.capabilities.gjEmoji && this.isFocused;
	}

	get couldShowEmojiPanel() {
		if (this.capabilities) {
			return this.capabilities.gjEmoji;
		}
	}

	get shouldShowEmojiControls() {
		return (
			!this.disabled && this.isFocused && this.capabilities.gjEmoji && this.emojiPanelVisible
		);
	}

	get isEmpty() {
		if (this.view instanceof EditorView) {
			return this.view.state.doc.toString().trim() === 'doc(paragraph)';
		}
		return false;
	}

	get shouldShowPlaceholder() {
		return this.placeholder.length > 0 && this.isEmpty;
	}

	get length() {
		if (this.view instanceof EditorView) {
			return ContentEditorService.getLength(this.view.state);
		}
		return 0;
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

			return data.toJson();
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
		const state = EditorState.create({
			doc: DOMParser.fromSchema(this.schema).parse(this.$refs.doc),
			schema: this.schema,
			plugins: this.plugins,
		});

		this.updateView(state);

		// Observe any resize events so the editor controls can be repositioned correctly
		const ro = new ResizeObserver(() => {
			this.stateCounter++;
		});
		ro.observe(this.$refs.doc);

		this.stateCounter++;

		this.focusWatcher = new FocusWatcher(this.$refs.editor, this.onFocusIn, this.onFocusOut);
		this.focusWatcher.start();

		if (this.view instanceof EditorView && this.autofocus && !Screen.isMobile) {
			this.$refs.editor.focus();
			this.view.focus();
		}
	}

	beforeDestroy() {
		if (this.focusWatcher instanceof FocusWatcher) {
			this.focusWatcher!.destroy();
		}
	}

	private updateView(state: EditorState) {
		if (this.view instanceof EditorView) {
			this.view.destroy();
		}

		const nodeViews = buildNodeViews(this);
		const eventHandlers = buildEvents(this.capabilities);
		this.view = new EditorView(this.$refs.doc, {
			state,
			nodeViews,
			handleDOMEvents: eventHandlers,
			editable: () => !this.disabled,
		});

		// Make sure we have a paragraph when loading in a new state
		if (!this.disabled || this.view.state.doc.childCount === 0) {
			const tr = ContentEditorService.ensureEndNode(
				this.view.state.tr,
				this.view.state.schema.nodes.paragraph
			);
			if (tr instanceof Transaction) {
				this.view.dispatch(tr);
			}
		}
	}

	onEmojisHide() {
		this.emojiPanelVisible = false;
	}

	async onTextControlClicked() {
		// When a text control got clicked, store the previous selection,
		// focus the editor and then apply the selection.
		// We do this so the focused text doesn't visibly lose focus after the text control
		// button assumed focus.
		const prevSelection = this.view!.state.selection;

		this.$refs.editor.focus();

		const tr = this.view!.state.tr;
		tr.setSelection(prevSelection);
		this.view!.dispatch(tr);

		// Wait a tick for the editor's doc to update, then force an update to reposition the controls.
		await Vue.nextTick();
		this.stateCounter++;
	}

	public getContent() {
		if (this.view instanceof EditorView) {
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
		if (this.schema instanceof Schema) {
			const jsonObj = ContentFormatAdapter.adaptIn(container);
			const state = EditorState.create({
				doc: Node.fromJSON(this.schema, jsonObj),
				schema: this.schema,
				plugins: this.plugins,
			});
			this.updateView(state);
		}
	}

	public onFocus() {
		// DEBUG: Don't do this when the viewer is showing
		if (this.showViewer) {
			return;
		}
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
