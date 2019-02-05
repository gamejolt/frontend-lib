import View from '!view!./image-form.html';
import { Component, Prop } from 'vue-property-decorator';
import { MaxFilesizes } from '../../../utils/file';
import { Api } from '../../api/api.service';
import { AppFormControlUpload } from '../../form-vue/control/upload/upload';
import { AppForm } from '../../form-vue/form';
import { BaseForm, FormOnInit, FormOnLoad, FormOnSubmit } from '../../form-vue/form.service';

interface FormModel {
	type: string;
	parent_id: number;
	file?: File;
	_progress: ProgressEvent | null;
}

@View
@Component({
	components: {
		AppFormControlUpload,
	},
})
export class FormThemeEditorImage extends BaseForm<FormModel>
	implements FormOnInit, FormOnLoad, FormOnSubmit {
	resetOnSubmit = true;
	warnOnDiscard = false;

	@Prop(String)
	type!: string;

	@Prop(Number)
	parentId!: number;

	$refs!: {
		form: AppForm;
	};

	maxFilesizes: MaxFilesizes = {};
	maxWidth = 0;
	maxHeight = 0;

	get loadUrl() {
		return `/web/dash/media-items`;
	}

	get loadData() {
		return this.formModel;
	}

	onInit() {
		this.setField('type', this.type);
		this.setField('parent_id', this.parentId);
	}

	onLoad(response: any) {
		this.maxFilesizes = response.MaxFilesizes;
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
