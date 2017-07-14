import { StateService } from 'angular-ui-router';
import { Model } from '../../../model/model.service';
import { getProvider } from '../../../../utils/utils';

export class FiresidePostTag extends Model {
	fireside_post_id: number;
	tag: string;
	added_on: number;

	getSref(page?: number, includeParams?: boolean) {
		let sref = 'fireside.tags.view';

		if (includeParams) {
			sref += '( ' + JSON.stringify(this.getSrefParams(page)) + ' )';
		}

		return sref;
	}

	getSrefParams(page?: number) {
		return { tag: this.tag, page: page };
	}

	getUrl(page?: number) {
		return getProvider<StateService>('$state').href(this.getSref(page), this.getSrefParams(page));
	}
}

Model.create(FiresidePostTag);
