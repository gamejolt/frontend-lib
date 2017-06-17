import Vue from 'vue';

export const AppFocusWhen: Vue.DirectiveFunction = (
	el: HTMLElement,
	binding
) => {
	if (
		(binding.value && binding.value !== binding.oldValue) ||
		typeof binding.value === 'undefined'
	) {
		el.focus();
	}
};
