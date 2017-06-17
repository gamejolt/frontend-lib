import Vue from 'vue';
import * as autosize from 'autosize';

export const AppFormAutosize: Vue.DirectiveOptions = {
	inserted(el) {
		autosize(el);
	},
	unbind(el) {
		autosize.destroy(el);
	},
};
