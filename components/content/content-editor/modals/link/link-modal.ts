import { Component } from 'vue-property-decorator';
import { BaseModal } from '../../../../modal/base';
import AppFormContentEditorLink from './form/link-form.vue';
import { LinkData } from './link-modal.service';

@Component({
	components: {
		AppFormContentEditorLink,
	},
})
export default class AppContentEditorLinkModal extends BaseModal {
	linkData: LinkData = {
		href: '',
		title: '',
	};

	onSubmit(data: LinkData) {
		if (!data.title) {
			data.title = data.href;
		}

		// Insert protocol if none given
		if (!/^https?:\/\//i.test(data.href)) {
			data.href = 'https://' + data.href;
		}

		this.modal.resolve(data);
	}
}
