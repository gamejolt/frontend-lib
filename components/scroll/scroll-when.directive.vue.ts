import Vue from 'vue';
import { Scroll } from './scroll.service';

export const AppScrollWhen: Vue.DirectiveFunction = (el, binding) => {
	if (binding.value && binding.value !== binding.oldValue) {
		Scroll.to(el, { animate: !!binding.modifiers.animate });
	}
};
