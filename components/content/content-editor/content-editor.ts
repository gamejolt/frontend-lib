import { DOMParser, Node, Schema } from 'prosemirror-model';
import { EditorState, Plugin, Transaction } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import 'prosemirror-view/style/prosemirror.css';
import { ResizeObserver } from 'resize-observer';
import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { Screen } from '../../screen/screen-service';
import { ContentContext, ContextCapabilities } from '../content-context';
import { ContentDocument } from '../content-document';
import { ContentFormatAdapter, ProsemirrorEditorFormat } from '../content-format-adapter';
import { ContentHydrator } from '../content-hydrator';
import { ContentOwner } from '../content-owner';
import { ContentEditorService } from './content-editor.service';
import { ContentTempResource } from './content-temp-resource.service';
import AppContentEditorBlockControls from './controls/block/controls.vue';
import AppContentEditorControlsEmojiPanelTS from './controls/emoji/panel';
import AppContentEditorControlsEmojiPanel from './controls/emoji/panel.vue';
import AppContentEditorTextControls from './controls/text/controls.vue';
import buildEvents from './events/build-events';
import { FocusWatcher } from './focus-watcher';
import { buildNodeViews } from './node-views/node-view-builder';
import { createPlugins } from './plugins/plugins';
import { generateSchema } from './schemas/content-editor-schema';

/**
 * @emits update
 */
@Component({
	components: {
		AppContentEditorBlockControls,
		AppContentEditorTextControls,
		AppContentEditorControlsEmojiPanel,
	},
})
export default class AppContentEditor extends Vue implements ContentOwner {
	@Prop(String)
	contentContext!: ContentContext;

	@Prop({ type: String, default: '' })
	placeholder!: string;

	@Prop(Boolean)
	autofocus!: boolean;

	@Prop({ type: Boolean, default: false })
	disabled!: boolean;

	@Prop(String)
	source!: string;

	@Prop({ type: Number, default: null })
	modelId!: number;

	@Prop(Number)
	minHeight!: number;

	view: EditorView | null = null;
	schema: Schema | null = null;
	plugins: Plugin[] | null = null;
	capabilities: ContextCapabilities = ContextCapabilities.getEmpty();
	hydrator!: ContentHydrator;

	focusWatcher: FocusWatcher | null = null;
	resizeObserver: ResizeObserver | null = null;

	stateCounter = 0;
	isFocused = false;
	emojiPanelVisible = false;
	controlsCollapsed = true;

	_tempModelId: number | null = null; // If no model id if gets passed in, we store a temp model's id here
	_sourceControlVal: string | null = null; // Keep a copy of the json version of the doc, to only set the content if the external source changed.

	$refs!: {
		editor: HTMLElement;
		doc: HTMLElement;
		emojiPanel: AppContentEditorControlsEmojiPanelTS;
	};

	get shouldShowControls() {
		return !this.disabled && this.isFocused && this.capabilities.hasAnyBlock;
	}

	get shouldShowTextControls() {
		return (
			!this.disabled &&
			this.isFocused &&
			this.capabilities.hasAnyText &&
			!this.emojiPanelVisible
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

	get isEmpty() {
		if (this.view instanceof EditorView) {
			return this.view.state.doc.toString().trim() === 'doc(paragraph)';
		}
		return false;
	}

	get shouldShowPlaceholder() {
		return (
			this.placeholder.length > 0 &&
			this.isEmpty &&
			(!this.shouldShowControls || this.controlsCollapsed)
		);
	}

	get editorStyleClass() {
		return this.contentContext + '-content';
	}

	get containerMinHeight() {
		if (!this.minHeight) {
			return 'auto';
		}
		return this.minHeight + 'px';
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

	async getModelId() {
		if (this.modelId === null) {
			if (!this._tempModelId) {
				this._tempModelId = await ContentTempResource.getTempModelId(this.contentContext);
			}
			return this._tempModelId;
		} else {
			return this.modelId;
		}
	}

	@Watch('source')
	public onSourceUpdated() {
		if (this._sourceControlVal !== this.source) {
			this._sourceControlVal = this.source;
			// If we receive an empty string, we assume the form gets reset.
			if (this.source === '') {
				this.reset();
			} else {
				const doc = ContentDocument.fromJson(this.source);
				this.setContent(doc);
			}
		}
	}

	public onUpdate(state: EditorState) {
		const source = ContentFormatAdapter.adaptOut(
			state.doc.toJSON() as ProsemirrorEditorFormat,
			this.contentContext
		).toJson();
		this._sourceControlVal = source;
		this.$emit('update', source);
	}

	private reset() {
		this._tempModelId = null;
		const doc = new ContentDocument(this.contentContext, []);
		this.setContent(doc);
	}

	mounted() {
		this.capabilities = ContextCapabilities.getForContext(this.contentContext);
		this.hydrator = new ContentHydrator();

		this.schema = generateSchema(this.capabilities);
		this.plugins = createPlugins(this, this.schema);

		if (this.source) {
			const doc = ContentDocument.fromJson(this.source);
			this.setContent(doc);
		} else {
			const state = EditorState.create({
				doc: DOMParser.fromSchema(this.schema).parse(this.$refs.doc),
				schema: this.schema,
				plugins: this.plugins,
			});

			this.updateView(state);
		}

		// Observe any resize events so the editor controls can be repositioned correctly
		this.resizeObserver = new ResizeObserver(() => {
			this.stateCounter++;
		});
		this.resizeObserver.observe(this.$refs.doc);

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
			this.focusWatcher.destroy();
		}
		if (this.resizeObserver instanceof ResizeObserver) {
			this.resizeObserver.disconnect();
		}
	}

	private updateView(state: EditorState) {
		if (this.view instanceof EditorView) {
			this.view.destroy();
		}

		const nodeViews = buildNodeViews(this);
		const eventHandlers = buildEvents(this);
		this.view = new EditorView(this.$refs.doc, {
			state,
			nodeViews,
			handleDOMEvents: eventHandlers,
			editable: () => !this.disabled,
			attributes: {
				'data-prevent-shortkey': '',
			},
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

	public setContent(doc: ContentDocument) {
		if (doc.context !== this.contentContext) {
			throw new Error(
				`The passed in content context is invalid. ${doc.context} != ${this.contentContext}`
			);
		}
		if (this.schema instanceof Schema) {
			this.hydrator = new ContentHydrator(doc.hydration);
			const jsonObj = ContentFormatAdapter.adaptIn(doc);
			const state = EditorState.create({
				doc: Node.fromJSON(this.schema, jsonObj),
				schema: this.schema,
				plugins: this.plugins,
			});
			this.updateView(state);
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

	private async highlightCurrentSelection() {
		// When an outside control got clicked, store the previous selection,
		// focus the editor and then apply the selection.
		// We do this so the focused text doesn't visibly lose focus after the outside control
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

	onTextControlClicked() {
		this.highlightCurrentSelection();
	}

	public showEmojiPanel() {
		if (this.$refs.emojiPanel instanceof AppContentEditorControlsEmojiPanel) {
			this.$refs.emojiPanel.show();
		}
	}

	onEmojiPanelVisibilityChanged(visible: boolean) {
		this.emojiPanelVisible = visible;
		if (this.emojiPanelVisible) {
			this.highlightCurrentSelection();
		}
	}

	onControlsCollapsedChanged(collapsed: boolean) {
		this.controlsCollapsed = collapsed;
	}
}
