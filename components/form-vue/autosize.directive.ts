import { DirectiveOptions } from 'vue';
import * as autosize from 'autosize';

export const AppFormAutosize: DirectiveOptions = {
	inserted(el) {
		autosize(el);
	},
	unbind(el) {
		autosize.destroy(el);
	},
};
