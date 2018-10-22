import View from '!view!./content-editor.html?style=./content-editor.styl';
import { baseKeymap, toggleMark } from 'prosemirror-commands';
import { history, redo, undo } from 'prosemirror-history';
import { keymap } from 'prosemirror-keymap';
import { DOMParser, Schema } from 'prosemirror-model';
import { schema as basicSchema } from 'prosemirror-schema-basic';
import { EditorState, Plugin } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import 'prosemirror-view/style/prosemirror.css';
import Vue from 'vue';
import { Component } from 'vue-property-decorator';

const isMac = typeof navigator != 'undefined' ? /Mac/.test(navigator.platform) : false;

const schema = new Schema({
	nodes: basicSchema.spec.nodes,
	marks: basicSchema.spec.marks,
});

const ourKeymap: { [k: string]: any } = {
	'Mod-z': undo,
	'Shift-Mod-z': redo,
	'Mod-b': toggleMark(schema.marks.strong),
	'Mod-i': toggleMark(schema.marks.em),
	'Mod-`': toggleMark(schema.marks.code),
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

@View
@Component({})
export class AppContentEditor extends Vue {
	state!: EditorState;
	view!: EditorView;

	$refs!: {
		doc: HTMLElement;
	};

	mounted() {
		this.state = EditorState.create({
			schema,
			doc: DOMParser.fromSchema(schema).parse(this.$refs.doc),
			plugins: [keymap(ourKeymap), keymap(baseKeymap), history(), selectionSizePlugin],
		});

		this.view = new EditorView(this.$refs.doc, { state: this.state });
	}
}
