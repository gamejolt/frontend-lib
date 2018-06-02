import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import View from '!view!./content-editor-styleguide.html';
import { AppContentEditor } from './content-editor';

@View
@Component({
	components: {
		AppContentEditor,
	},
})
export class AppContentEditorStyleguide extends Vue {}
