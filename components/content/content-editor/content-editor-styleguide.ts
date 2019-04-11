import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import AppContentEditor from './content-editor.vue';

@Component({
	components: {
		AppContentEditor,
	},
})
export default class AppContentEditorStyleguide extends Vue {}
