import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import View from '!view!./form.html';
import * as VeeValidate from 'vee-validate';

import { findRequiredVueParent } from '../../utils/vue';
import { BaseForm } from './form.service';
import { FormValidatorPattern } from './validators/pattern';
import { FormValidatorAvailability } from './validators/availability';
import { BaseFormControl } from './control/base';
import { FormValidatorFilesize } from './validators/filesize';
import { FormValidatorImgRatio } from './validators/img_ratio';
import { FormValidatorMinImgRatio } from './validators/min_img_ratio';
import { FormValidatorMaxImgRatio } from './validators/max_img_ratio';
import { FormValidatorImgDimensions } from './validators/img_dimensions';
import { FormValidatorMinImgDimensions } from './validators/min_img_dimensions';
import { FormValidatorMaxImgDimensions } from './validators/max_img_dimensions';
import { FormValidatorAccept } from './validators/accept';
import { FormValidatorCcExp } from './validators/cc_exp';
import { FormValidatorCcExpExpired } from './validators/cc_exp_expired';
import { AppLoading } from '../../vue/components/loading/loading';
import { FormValidatorMinDate } from './validators/min_date';
import { FormValidatorMaxDate } from './validators/max_date';
import { AppLoadingFade } from '../loading/fade/fade';

Vue.use(VeeValidate);

@View
@Component({
	components: {
		AppLoading,
		AppLoadingFade,
	},
})
export class AppForm extends Vue {
	@Prop(String) name: string;

	base: BaseForm<any>;
	controls: BaseFormControl[] = [];

	private static hasAddedValidators = false;

	get isLoaded() {
		// Check specifically false so that "null" is correctly shown as loaded.
		return this.base.isLoaded !== false;
	}

	get isLoadedBootstrapped() {
		// Check specifically false so that "null" is correctly shown as loaded.
		return this.base.isLoadedBootstrapped !== false;
	}

	get hasErrors() {
		let hasErrors = false;

		this.controls.forEach(control => {
			if (control.$validator.getErrors().count() > 0) {
				hasErrors = true;
			}
		});

		return hasErrors;
	}

	@Watch('hasErrors')
	onHasErrorsChange(hasErrors: boolean) {
		this.base.hasFormErrors = hasErrors;
	}

	created() {
		this.base = findRequiredVueParent(this, require('./form.service').BaseForm);

		// We gotta make sure that the initial values are correct.
		this.base.hasFormErrors = this.hasErrors;
	}

	mounted() {
		if (!AppForm.hasAddedValidators) {
			this.$validator.extend('pattern', FormValidatorPattern);
			this.$validator.extend('availability', FormValidatorAvailability);
			this.$validator.extend('filesize', FormValidatorFilesize);
			this.$validator.extend('accept', FormValidatorAccept);
			this.$validator.extend('img_ratio', FormValidatorImgRatio);
			this.$validator.extend('min_img_ratio', FormValidatorMinImgRatio);
			this.$validator.extend('max_img_ratio', FormValidatorMaxImgRatio);
			this.$validator.extend('img_dimensions', FormValidatorImgDimensions);
			this.$validator.extend('min_img_dimensions', FormValidatorMinImgDimensions);
			this.$validator.extend('max_img_dimensions', FormValidatorMaxImgDimensions);
			this.$validator.extend('cc_exp', FormValidatorCcExp);
			this.$validator.extend('cc_exp_expired', FormValidatorCcExpExpired);
			this.$validator.extend('min_date', FormValidatorMinDate);
			this.$validator.extend('max_date', FormValidatorMaxDate);
			AppForm.hasAddedValidators = true;
		}
	}

	async validate() {
		const promises = this.controls.map(async control => {
			// vee-validate throws an error for failed validation
			try {
				await control.$validator.validateAll();
			} catch (_e) {}
		});

		await Promise.all(promises);
	}

	async submit() {
		// Wait until all form controls have settled into their final values.
		await this.$nextTick();

		// Gotta validate all controls first.
		await this.validate();

		// If we have validation errors, don't let it pass through.
		if (!this.base.valid) {
			return false;
		}

		return await this.base._onSubmit();
	}

	onChange() {
		this.base.changed = true;
		this.$emit('changed', this.base.formModel);
	}
}
