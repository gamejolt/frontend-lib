import { Api } from '../../api/api.service';

export async function FormValidatorAvailability(value: string, args: [string]) {
	// Skip the check if our initial value still isn't set yet.
	// The validator runs before the initial value gets set, so skip it if we haven't gotten the initialVal yet.
	// if ( angular.isUndefined( initialVal ) || ngModel.$isEmpty( value ) || initialVal === value ) {
	// 	return $q.when( true );
	// }

	try {
		await Api.sendRequest(args[0], { value }, { detach: true, processPayload: false });
	} catch (_e) {
		return { valid: false };
	}

	return { valid: true };
}
