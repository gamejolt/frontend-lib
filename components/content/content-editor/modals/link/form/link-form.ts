import View from '!view!./link-form.html';
import { LinkData } from 'game-jolt-frontend-lib/components/content/content-editor/modals/link/link-modal.service';
import { BaseForm, FormOnInit } from 'game-jolt-frontend-lib/components/form-vue/form.service';
import { Component } from 'vue-property-decorator';

@View
@Component({})
export class FormContentEditorLink extends BaseForm<LinkData> implements FormOnInit {
	get valid() {
		return this.formModel.href.length > 0;
	}

	onInit() {
		this.setField('href', '');
		this.setField('title', '');
	}
}
