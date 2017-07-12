import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./button-styleguide.html';
import { AppJolticon } from '../../vue/components/jolticon/jolticon';

@View
@Component({
	components: {
		AppJolticon,
	},
})
export class AppButtonStyleguide extends Vue {}
