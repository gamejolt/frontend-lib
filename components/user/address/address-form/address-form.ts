import { Watch, Component } from 'vue-property-decorator';
import View from '!view!./address-form.html';

import { BaseForm, FormOnSubmitSuccess, FormOnSubmitError } from '../../../form-vue/form.service';
import { Address } from '../address.model';
import { Geo, Region } from '../../../geo/geo.service';
import { Growls } from '../../../growls/growls.service';

@View
@Component({})
export class FormUserAddress extends BaseForm<Address>
	implements FormOnSubmitSuccess, FormOnSubmitError {
	modelClass = Address;

	countries = Geo.getCountries();
	regions: Region[] | null = null;
	initialLoad = true;

	@Watch('formModel.country')
	onCountryChange() {
		this.regions = Geo.getRegions(this.formModel.country) || null;
		if (this.regions) {
			this.setField('region', this.regions[0].code); // Default to first.
		} else if (!this.initialLoad) {
			// accept the initial value in this field
			this.setField('region', '');
		}
		this.initialLoad = false;
	}

	onSubmitSuccess(response: any) {
		Growls.success('Successfully updated your Billing Address.', 'Edit Billing Address');
	}

	onSubmitError(response: any) {
		Growls.error('Failed to update your Billing Address.', 'Edit Billing Address');
	}
}
