import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./theme-editor.html?style=./theme-editor.styl';

import { SiteTemplate } from '../../site/template/template-model';
import { Api } from '../../api/api.service';
import { AppCodemirror } from '../../codemirror/codemirror';
import { AppLoading } from '../../../vue/components/loading/loading';
import { AppThemeEditorFontSelector } from './font-selector';
import { AppThemeEditorImage } from './image';
import { AppColorpicker } from '../../colorpicker/colorpicker';

interface StyleGroup {
	name: string;
	sections: {
		section: string;
		definitions: string[];
	}[];
}

@View
@Component({
	components: {
		AppLoading,
		AppCodemirror,
		AppThemeEditorFontSelector,
		AppThemeEditorImage,
		AppColorpicker,
	},
})
export class AppThemeEditor extends Vue {
	@Prop(String) windowId: string;
	@Prop(Number) template: number;
	@Prop(Object) theme: any;
	@Prop(Number) resourceId: number;

	isLoaded = false;

	selectedGroup: StyleGroup = null as any;
	templateObj: SiteTemplate = {} as any;
	definition: any = {};

	private initialTheme: any = null;

	async created() {
		// Save the initial content, as well.
		this.initialTheme = Object.assign({}, this.theme);

		const response = await Api.sendRequest('/sites-io/get-template/' + this.template, undefined, {
			detach: true,
		});

		this.isLoaded = true;

		this.templateObj = new SiteTemplate(response.template);
		this.definition = this.templateObj.data;
		this.selectedGroup = this.definition.styleGroups[0];

		// Make sure we update the page with the current theme.
		this.refresh(true);
	}

	async refresh(initial = false) {
		// Gotta wait for the value to be saved.
		await this.$nextTick();

		const iframe = document.getElementById(this.windowId) as HTMLIFrameElement | undefined;
		if (iframe) {
			const msg = {
				type: 'theme-update',
				template: this.templateObj,
				definition: this.definition,
				theme: this.theme,
			};

			iframe.contentWindow.postMessage(msg, '*');
		}

		if (!initial) {
			this.$emit('change', this.theme);
		}
	}

	updateField(field: string, content: string) {
		this.theme[field] = content;
		this.refresh();
	}
}
