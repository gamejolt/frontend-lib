import View from '!view!./content-editor-styleguide.html';
import { AppContentEditor } from 'game-jolt-frontend-lib/components/content/content-editor/content-editor';
import Vue from 'vue';
import { Component } from 'vue-property-decorator';

@View
@Component({
	components: {
		AppContentEditor,
	},
})
export class AppContentEditorStyleguide extends Vue {}
