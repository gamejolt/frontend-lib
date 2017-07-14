import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./image-form.html';

import {
	BaseForm,
	FormOnInit,
	FormOnSubmit,
} from '../../form-vue/form.service';
import { Api } from '../../api/api.service';
import { AppFormLoader } from '../../form-vue/loader/loader';
import { AppFormControlUpload } from '../../form-vue/control/upload/upload';
import { AppForm } from '../../form-vue/form';

interface FormModel {
	type: string;
	parent_id: number;
	file?: File;
	_progress: ProgressEvent | null;
}

@View
@Component({
	components: {
		AppFormLoader,
		AppFormControlUpload,
	},
})
export class FormThemeEditorImage extends BaseForm<FormModel>
	implements FormOnInit, FormOnSubmit {
	resetOnSubmit = true;

	@Prop(String) type: string;
	@Prop(Number) parentId: number;

	$refs: {
		form: AppForm;
	};

	maxFilesize = 0;
	maxWidth = 0;
	maxHeight = 0;

	onInit() {
		this.setField('type', this.type);
		this.setField('parent_id', this.parentId);
	}

	onLoaded(response: any) {
		this.maxFilesize = response.maxFilesize;
		this.maxWidth = response.maxWidth;
		this.maxHeight = response.maxHeight;
	}

	submit() {
		this.$refs.form.submit();
	}

	onSubmit() {
		return Api.sendRequest('/web/dash/media-items/add-one', this.formModel, {
			file: this.formModel.file,
			progress: event => this.setField('_progress', event),
		});
	}
}
