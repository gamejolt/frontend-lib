import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./button.html';
import { AppJolticon } from '../../../vue/components/jolticon/jolticon';

@View
@Component({
	components: {
		AppJolticon,
	}
})
export class AppFormButton extends Vue
{
	@Prop( String ) icon?: string;
}
