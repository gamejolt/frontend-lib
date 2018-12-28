import View from '!view!./content-editor.html?style=./content-editor.styl';
import { VideoView } from 'game-jolt-frontend-lib/components/content-editor/node-views/video-view';
import { baseKeymap, toggleMark } from 'prosemirror-commands';
import { history, redo, undo } from 'prosemirror-history';
import { keymap } from 'prosemirror-keymap';
import { DOMParser } from 'prosemirror-model';
import { EditorState, Plugin } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import 'prosemirror-view/style/prosemirror.css';
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { AppContentEditorControls } from './controls/content-editor-controls';
import { mainSchema } from './schema';

const isMac = typeof navigator != 'undefined' ? /Mac/.test(navigator.platform) : false;

const ourKeymap: { [k: string]: any } = {
	'Mod-z': undo,
	'Shift-Mod-z': redo,
	'Mod-b': toggleMark(mainSchema.marks.strong),
	'Mod-i': toggleMark(mainSchema.marks.em),
	'Mod-`': toggleMark(mainSchema.marks.code),
};

if (!isMac) {
	ourKeymap['Mod-y'] = redo;
}

const selectionSizePlugin = new Plugin({
	view(editorView) {
		return new SelectionSizeTooltip(editorView);
	},
});

class SelectionSizeTooltip {
	tooltip: HTMLElement;

	constructor(view: EditorView) {
		this.tooltip = document.createElement('div');
		// this.tooltip.className = 'tooltip';
		view.dom.parentNode!.appendChild(this.tooltip);

		this.update(view, null);
	}

	update(view: EditorView, lastState: EditorState | null) {
		const state = view.state;

		// Don't do anything if the document/selection didn't change
		if (lastState && lastState.doc.eq(state.doc) && lastState.selection.eq(state.selection)) {
			return;
		}

		console.log('test', state.selection.empty);

		// Hide the tooltip if the selection is empty
		if (state.selection.empty) {
			this.tooltip.style.display = 'none';
			return;
		}

		// Otherwise, reposition it and update its content
		this.tooltip.style.display = '';
		const { from, to } = state.selection;
		// These are in screen coordinates
		const start = view.coordsAtPos(from),
			end = view.coordsAtPos(to);
		// The box in which the tooltip is positioned, to use as base
		const box = this.tooltip.offsetParent.getBoundingClientRect();
		// Find a center-ish x position from the selection endpoints (when
		// crossing lines, end may be more to the left)
		const left = Math.max((start.left + end.left) / 2, start.left + 3);
		this.tooltip.style.left = left - box.left + 'px';
		this.tooltip.style.bottom = box.bottom - start.top + 'px';
		this.tooltip.style.position = 'absolute';
		this.tooltip.textContent = to - from + '';
	}

	destroy() {
		this.tooltip.remove();
	}
}

class UpdateIncrementerPlugin {
	view: EditorView;
	appEditor: AppContentEditor;

	constructor(view: EditorView, appEditor: AppContentEditor) {
		this.view = view;
		this.appEditor = appEditor;
	}

	update(view: EditorView, lastState: EditorState | null) {
		const state = view.state;
		if (lastState && lastState.doc.eq(state.doc) && lastState.selection.eq(state.selection)) {
			return;
		}
		this.appEditor.stateCounter++;
	}
}

@View
@Component({
	components: {
		AppContentEditorControls,
	},
})
export class AppContentEditor extends Vue {
	state!: EditorState;
	view: EditorView | null = null;
	stateCounter = 0;

	$refs!: {
		doc: HTMLElement;
	};

	mounted() {
		const mySchema = mainSchema;

		// This is used to update any children with the new view.
		// We don't want to watch the view/state objects because they are too heavy.
		// So instead, this increments a counter every time the state changes
		const that = this;
		const incrementerPlugin = new Plugin({
			view(editorView) {
				return new UpdateIncrementerPlugin(editorView, that);
			},
		});

		this.state = EditorState.create({
			doc: DOMParser.fromSchema(mySchema).parse(this.$refs.doc),
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
}
