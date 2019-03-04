import View from '!view!./tag.html?style=./tag.styl';
import { EditorView } from 'prosemirror-view';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@View
@Component({
	components: {},
})
export class AppContentTag extends Vue {
	@Prop(String)
	text!: string;

	@Prop(EditorView)
	editorView!: EditorView;
}
