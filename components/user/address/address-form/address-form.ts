import { Watch, Component } from 'vue-property-decorator';
import View from '!view!./address-form.html';

import { BaseForm } from '../../../form-vue/form.service';
import { Address } from '../address.model';
import { Geo, Region } from '../../../geo/geo.service';

@View
@Component({})
export class FormUserAddress extends BaseForm<Address> {
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

	async onSave() {
		console.log('maybe this');
	}
}
