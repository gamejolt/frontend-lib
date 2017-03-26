import Vue from 'vue';

export const AppFocusWhen: Vue.DirectiveOptions = {
	inserted( el: HTMLElement )
	{
		el.focus();
	},
	update( el: HTMLElement, binding )
	{
		if ( binding.value && binding.value !== binding.oldValue ) {
			el.focus();
		}
	},
};
