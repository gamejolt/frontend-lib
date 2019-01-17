import View from '!view!./link-modal.html?style=./link-modal.styl';
import { LinkData } from 'game-jolt-frontend-lib/components/content/content-editor/modals/link/link-modal.service';
import { Component } from 'vue-property-decorator';
import { BaseModal } from '../../../../modal/base';
import { FormContentEditorLink } from './form/link-form';

@View
@Component({
	components: {
		FormContentEditorLink,
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
		this.modal.resolve(data);
	}
}
