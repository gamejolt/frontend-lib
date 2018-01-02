import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import View from '!view!./link-styleguide.html';

import { AppRouterLink } from './link';

@View
@Component({
	components: {
		AppRouterLink,
	},
})
export class AppLinkStyleguide extends Vue {}
