import { Model } from '../../model/model.service';

export class UserVerificationApplication extends Model {
	application!: string;

	$save() {
		return this.$_save('/web/dash/verified_account/save', 'verificationApplication');
	}
}

Model.create(UserVerificationApplication);
