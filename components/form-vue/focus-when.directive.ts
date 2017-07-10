import Vue from 'vue';

export const AppFocusWhen: Vue.DirectiveOptions = {
	update: (el: HTMLElement, binding) => {
		if (
			(binding.value && binding.value !== binding.oldValue) ||
			(typeof binding.value === 'undefined' &&
				el.dataset.appFocusWhen !== 'focused')
		) {
			el.focus();
			el.dataset.appFocusWhen = 'focused';
		}
	},
};
