import AppFormContentEditorLink from 'game-jolt-frontend-lib/components/content/content-editor/modals/link/form/link-form.vue';
import { LinkData } from 'game-jolt-frontend-lib/components/content/content-editor/modals/link/link-modal.service';
import { Component } from 'vue-property-decorator';
import { BaseModal } from '../../../../modal/base';

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
