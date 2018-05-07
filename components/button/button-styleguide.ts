import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import View from '!view!./button-styleguide.html';

import { AppJolticon } from '../../vue/components/jolticon/jolticon';
import { AppButton } from './button';

@View
@Component({
	components: {
		AppButton,
		AppJolticon,
	},
})
export class AppButtonStyleguide extends Vue {}
