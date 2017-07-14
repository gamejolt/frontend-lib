import Vue from 'vue';
import { Prop, Component } from 'vue-property-decorator';

import { AppForm } from './form';
import { AppFormControl } from './control/control';
import { AppFormGroup } from './group/group';
import { AppFormControlErrors } from './control-errors/control-errors';
import { AppFormControlError } from './control-errors/control-error';
import { AppFormButton } from './button/button';
import { AppFormControlSelect } from './control/select/select';
import { AppFormControlTextarea } from './control/textarea/textarea';
import { AppFormControlRadio } from './control/radio/radio';
import { AppFormControlCheckbox } from './control/checkbox/checkbox';

export interface FormOnInit {
	onInit(): void;
}

export interface FormOnSubmit {
	onSubmit(): Promise<any>;
}

export interface FormOnSubmitSuccess {
	onSubmitSuccess(response: any): void;
}

export const CommonFormComponents = {
	AppForm,
	AppFormControl,
	AppFormControlSelect,
	AppFormControlTextarea,
	AppFormControlRadio,
	AppFormControlCheckbox,
	AppFormGroup,
	AppFormControlErrors,
	AppFormControlError,
	AppFormButton,
};

@Component({
	components: {
		...CommonFormComponents,
	},
})
export class BaseForm<T> extends Vue {
	@Prop(Object) model?: Readonly<T>;

	formModel: Readonly<T> = {} as T;
	modelClass?: { new (data?: T): T } = undefined;
	resetOnSubmit = false;
	saveMethod?: keyof T;
	method: 'add' | 'edit' = 'add';
	changed = false;
	valid = false;

	state: { [k: string]: any } = {
		isProcessing: false,
		isShowingSuccess: false,
	};

	successClearTimeout?: NodeJS.Timer;
	serverErrors: { [k: string]: boolean } = {};

	created() {
		this._init();
	}

	private _init() {
		this.changed = false;

		// Is a base model defined? If so, then we're editing.
		if (this.model) {
			this.method = 'edit';

			// If a model class was assigned to this form, then create a copy of
			// it on the instance. Otherwise just copy the object.
			if (this.modelClass) {
				this.formModel = new this.modelClass(this.model);
			} else {
				this.formModel = Object.assign({}, this.model);
			}
		} else {
			// If we have a model class, then create a new one.
			if (this.modelClass) {
				this.formModel = new this.modelClass();
			} else {
				// Otherwise, just use an empty object as the form's model.
				this.formModel = {} as T;
			}
		}

		// This is the main way for forms to initialize.
		if ((this as any).onInit) {
			(this as any).onInit();
		}
	}

	/**
	 * When setting form model field values we need to make sure Vue knows that
	 * the field has changed. This ensures that we always let Vue know any time
	 * we change a field.
	 */
	setField<K extends keyof T>(key: K, value: T[K]) {
		Vue.set(this.formModel as T, key, value);
	}

	setState(key: string, value: any) {
		Vue.set(this.state, key, value);
	}

	async _onSubmit() {
		if (this.state.isProcessing) {
			return false;
		}

		this.state.isProcessing = true;

		let response: any;

		try {
			if ((this as any).onSubmit) {
				const _response = await (this as any).onSubmit();
				if (_response.success === false) {
					throw _response;
				}

				response = _response;
			} else if (this.modelClass) {
				response = await (this.formModel as any)[this.saveMethod || '$save']();

				// Copy it back to the base model.
				if (this.model) {
					Object.assign(this.model, this.formModel);
				}
			}

			if ((this as any).onSubmitSuccess) {
				(this as any).onSubmitSuccess(response);
			}

			// Send the new model back into the submit handler.
			this.$emit('submit', this.formModel, response);

			// Reset our processing state.
			this.state.isProcessing = false;

			// Make sure that serverErrors is reset on a successful submit, just in case.
			this.serverErrors = {};

			// Show successful form submission.
			this._showSuccess();

			// If we should reset on successful submit, let's do that now.
			if (this.resetOnSubmit) {
				this._init();
			}

			return true;
		} catch (_response) {
			console.error('Form error', _response);

			// Store the server validation errors.
			if (_response && _response.errors) {
				this.serverErrors = _response.errors;
			}

			// Reset our processing state.
			this.state.isProcessing = false;
			return false;
		}
	}

	private _showSuccess() {
		// Reset the timeout if it's already showing.
		if (this.successClearTimeout) {
			clearTimeout(this.successClearTimeout);
		}

		this.state.isShowingSuccess = true;

		this.successClearTimeout = setTimeout(() => {
			this.state.isShowingSuccess = false;
			this.successClearTimeout = undefined;
		}, 2000);
	}
}
