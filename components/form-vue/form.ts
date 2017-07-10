import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import * as View from '!view!./form.html';
import * as VeeValidate from 'vee-validate';

import { findVueParent } from '../../utils/vue';
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

Vue.use(VeeValidate);

@View
@Component({})
export class AppForm extends Vue {
	@Prop([String])
	name: string;

	base: BaseForm<any>;
	controls: BaseFormControl[] = [];

	private static hasAddedValidators = false;

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
		this.base.valid = !hasErrors;
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
			this.$validator.extend(
				'min_img_dimensions',
				FormValidatorMinImgDimensions
			);
			this.$validator.extend(
				'max_img_dimensions',
				FormValidatorMaxImgDimensions
			);
			this.$validator.extend('cc_exp', FormValidatorCcExp);
			this.$validator.extend('cc_exp_expired', FormValidatorCcExpExpired);
			AppForm.hasAddedValidators = true;
		}
	}

	created() {
		this.base = findVueParent(this, BaseForm) as BaseForm<any>;
		if (!this.base) {
			throw new Error(`Couldn't find BaseForm in parent tree.`);
		}

		// We gotta make sure that the initial values are correct.
		this.base.valid = !this.hasErrors;
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

	async onSubmit() {
		// Gotta validate all controls first.
		await this.validate();

		// If we have validation errors, don't let it pass through.
		if (this.hasErrors) {
			return;
		}

		this.base._onSubmit();
	}

	onChange() {
		this.base.changed = true;
		this.$emit('changed', this.base.formModel);
	}
}
