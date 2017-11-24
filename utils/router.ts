import Vue from 'vue';
import VueRouter, { Route, RouteConfig, Location } from 'vue-router';

import { routeError404, RouteError404 } from '../components/error/page/page.route';
import { initScrollBehavior } from '../components/scroll/auto-scroll/autoscroll.service';

export function initRouter(appRoutes: RouteConfig[]) {
	Vue.use(VueRouter);

	const routes = [...appRoutes, routeError404];

	return new VueRouter({
		mode: !GJ_IS_CLIENT ? 'history' : 'hash',
		routes,
		scrollBehavior: initScrollBehavior(),
	});
}

/**
 * In order for vue-router to capture the clicks and switch routes, every link
 * must be done inside a router-link element. This captures A tags that may not
 * be in router-link and tries to route them if it points to a correct route.
 */
export function hijackLinks(router: VueRouter, host: string) {
	if (GJ_IS_SSR) {
		return;
	}

	document.body.addEventListener('click', e => {
		// Should we handle this event?
		if (!guardHijackEvent(e)) {
			return;
		}

		// Try to find an A tag.
		let target = e.target as HTMLAnchorElement;
		if (!(target instanceof HTMLElement)) {
			return;
		}

		while (target.nodeName.toLowerCase() !== 'a') {
			// Immediately stop if we hit the end.
			if ((target as any) === document || !target.parentNode) {
				return;
			}
			target = target.parentNode as HTMLAnchorElement;
		}

		let href = target.href;
		if (!href) {
			return;
		}

		href = href.replace('http://' + host, '').replace('https://' + host, '');

		// Now try to match it against our routes and see if we got anything. If
		// we match a 404 it's obviously wrong.
		const matched = router.getMatchedComponents(href);
		if (!matched.length || matched[0] === RouteError404) {
			return;
		}

		// We matched a route! Let's go to it and stop the browser from doing
		// anything with the link click.
		e.preventDefault();
		router.push(href);
	});
}

// Basically taken from vue-router router-link. Decides if we should do any
// logic against this particular event.
function guardHijackEvent(e: any) {
	const ke = e as KeyboardEvent;
	const me = e as MouseEvent;

	// don't redirect with control keys
	if (ke.metaKey || ke.altKey || ke.ctrlKey || ke.shiftKey) {
		return false;
	}

	// don't redirect when preventDefault called
	if (e.defaultPrevented) {
		return false;
	}

	// don't redirect on right click
	if (me.button !== undefined && me.button !== 0) {
		return;
	}

	// don't redirect if `target="_blank"`
	if (e.currentTarget && e.currentTarget.getAttribute) {
		const target = e.currentTarget.getAttribute('target');
		if (/\b_blank\b/i.test(target)) {
			return false;
		}
	}

	return true;
}

export class LocationRedirect {
	constructor(public location: Location) {}

	static fromRoute(from: Route, params: any, query: any = {}) {
		return new LocationRedirect({
			name: from.name,
			params: Object.assign({}, from.params, params),
			query: Object.assign({}, from.query, query),
			hash: from.hash,
			replace: true,
		});
	}
}

export function enforceLocation(route: Route, params: any, query: any = {}) {
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
