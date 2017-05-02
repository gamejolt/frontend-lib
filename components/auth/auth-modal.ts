import { Component } from 'vue-property-decorator';
import * as View from '!view!./auth-modal.html';

import { BaseModal } from '../modal/base';
import { AppAuthJoin } from './join/join';
import { AppJolticon } from '../../vue/components/jolticon/jolticon';

@View
@Component({
	components: {
		AppJolticon,
		AppAuthJoin,
	}
})
export default class AppAuthModal extends BaseModal
{

}
