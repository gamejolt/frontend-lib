import { EditorView } from 'prosemirror-view';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@Component({})
export default class AppContentTag extends Vue {
	@Prop(String)
	text!: string;

	@Prop(EditorView)
	editorView!: EditorView;
}
