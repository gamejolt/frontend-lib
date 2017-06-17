import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./button.html?style=./button.styl';

import { AppJolticon } from '../../../vue/components/jolticon/jolticon';
import { AppForm } from '../form';
import { findVueParent } from '../../../utils/vue';

@View
@Component({
	components: {
		AppJolticon,
	},
})
export class AppFormButton extends Vue {
	@Prop(String) icon?: string;

	form: AppForm;

	created() {
		this.form = findVueParent(this, AppForm) as AppForm;
	}
}
