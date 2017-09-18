import VueRouter from 'vue-router';

type ResourceIdInput = number | string;

export class PartnerReferral {
	static trackReferrer(resource: string, resourceId: ResourceIdInput, route: VueRouter.Route) {
		if (GJ_IS_SSR) {
			return;
		}

		const ref = route.query.ref;
		if (ref) {
			window.sessionStorage.setItem(`partner-ref:${resource}:${resourceId}`, ref);
		}
	}

	static getReferrer(resource: string, resourceId: ResourceIdInput) {
		if (GJ_IS_SSR) {
			return null;
		}

		return window.sessionStorage.getItem(`partner-ref:${resource}:${resourceId}`);
	}
}
