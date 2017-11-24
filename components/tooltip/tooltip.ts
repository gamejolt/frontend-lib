import { DirectiveOptions } from 'vue';
import './tooltip.styl';

let AppTooltip: DirectiveOptions = {};
if (!GJ_IS_SSR) {
	const mod: any = require('v-tooltip');
	const VTooltip: any = mod.default;
	AppTooltip = mod.VTooltip;

	// Hide on mobile sizes.
	VTooltip.enabled = window.innerWidth > 768;
}

export { AppTooltip };
