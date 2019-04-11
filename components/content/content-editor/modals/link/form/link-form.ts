import { Component } from 'vue-property-decorator';
import { AppFocusWhen } from '../../../../../form-vue/focus-when.directive';
import { BaseForm, FormOnInit } from '../../../../../form-vue/form.service';
import { LinkData } from '../link-modal.service';

@Component({
	directives: {
		AppFocusWhen,
	},
})
export default class AppFormContentEditorLink extends BaseForm<LinkData> implements FormOnInit {
	get valid() {
		return this.formModel.href.length > 0;
	}

	onInit() {
		this.setField('href', '');
		this.setField('title', '');
	}
}
