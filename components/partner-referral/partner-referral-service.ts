import { parse } from 'qs';

export class PartnerReferral {
	static trackReferrer(resource: string, resourceId: number) {
		if (GJ_IS_SSR) {
			return;
		}

		const queryParams = parse(window.location.search.substring(1));
		const ref = queryParams['ref'];

		if (ref) {
			window.sessionStorage.setItem(
				`partner-ref:${resource}:${resourceId}`,
				ref
			);
		}
	}

	static getReferrer(resource: string, resourceId: number) {
		if (GJ_IS_SSR) {
			return null;
		}

		return window.sessionStorage.getItem(
			`partner-ref:${resource}:${resourceId}`
		);
	}
}
