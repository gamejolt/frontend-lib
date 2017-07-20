import Vue from 'vue';
import VueRouter from 'vue-router';

import { routeError404 } from '../components/error/page/page.route';
import { initScrollBehavior } from '../components/scroll/auto-scroll/autoscroll.service';

export function initRouter(appRoutes: VueRouter.RouteConfig[]) {
	Vue.use(VueRouter);

	const routes = [...appRoutes, routeError404];

	return new VueRouter({
		mode: !GJ_IS_CLIENT ? 'history' : undefined,
		routes,
		scrollBehavior: initScrollBehavior(),
	});
}

export class LocationRedirect {
	constructor(public location: VueRouter.Location) {}

	static fromRoute(from: VueRouter.Route, params: any, query: any = {}) {
		return new LocationRedirect({
			name: from.name,
			params: Object.assign({}, from.params, params),
			query: Object.assign({}, from.query, query),
			hash: from.hash,
			replace: true,
		});
	}
}

export function enforceLocation(route: VueRouter.Route, params: any, query: any = {}) {
	for (const key in params) {
		if (route.params[key] !== params[key]) {
			return LocationRedirect.fromRoute(route, params, query);
		}
	}

	for (const key in query) {
		if (route.query[key] !== query[key]) {
			return LocationRedirect.fromRoute(route, params, query);
		}
	}
}
