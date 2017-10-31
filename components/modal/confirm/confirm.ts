import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./confirm.html';

import { AppJolticon } from '../../../vue/components/jolticon/jolticon';
import { BaseModal } from '../base';

@View
@Component({
	components: {
		AppJolticon,
	},
})
export default class AppModalConfirm extends BaseModal {
	@Prop(String) message: string;
	@Prop(String) title: string;
	@Prop(String) buttonType: 'ok' | 'yes';

	ok() {
		this.modal.resolve(true);
	}

	cancel() {
		this.modal.resolve(false);
	}
}
