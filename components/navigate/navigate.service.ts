import VueRouter from 'vue-router';
import { Environment } from '../environment/environment.service';

export type DestructorFunc = (href?: string) => void;

export class Navigate {
	private static router: VueRouter | null = null;
	private static redirecting = false;
	private static destructors: DestructorFunc[] = [];

	static get isRedirecting() {
		return this.redirecting;
	}

	static get currentSection() {
		if (window.location.href.startsWith(Environment.wttfBaseUrl)) {
			return 'app';
		} else if (window.location.href.startsWith(Environment.authBaseUrl)) {
			return 'auth';
		} else if (window.location.href.startsWith(Environment.checkoutBaseUrl)) {
			return 'checkout';
		} else if (window.location.href.startsWith(Environment.clientSectionUrl)) {
			return 'client';
		}

		return null;
	}

	static init(router: VueRouter) {
		this.router = router;
	}

	private static callDestructors(href?: string) {
		while (this.destructors.length > 0) {
			const destructor = this.destructors.shift();
			if (destructor) {
				destructor(href);
			}
		}
	}

	static registerDestructor(destructor: DestructorFunc) {
		this.destructors.push(destructor);
	}

	static reload() {
		this.redirecting = true;

		this.callDestructors();

		if (GJ_IS_CLIENT) {
			nw.Window.get().reload();
		} else {
			window.location.reload();
		}
	}

	private static gotoHard(href: string) {
		console.log('Hard redirecting');
		this.redirecting = true;

		this.callDestructors(href);
		window.location.href = href;
	}

	/**
	 * Goes to a url. By default it'll try doing a soft redirect using the section router if possible.
	 *
	 * @param href The url to redirect to
	 * @param forceHardRedirect True if to always to a hard redirect,
	 * even if it can be redirected in the same route without reloading the entire SPA.
	 */
	static goto(href: string, forceHardRedirect?: boolean) {
		this.gotoHard(href);
		return;

		// Doesn't work in prod for some reason. temporarily disabled.
		// if (forceHardRedirect || !this.router) {
		// 	this.gotoHard(href);
		// 	return;
		// }

		// const current = window.location.href;

		// // This should never happen, if it does it's an error but we'll
		// // redirect anyways and let the browser try handling this.
		// if (!current.endsWith(this.router.currentRoute.fullPath)) {
		// 	this.gotoHard(href);
		// 	return;
		// }

		// // Find the base url by removing the current route's fullPath from it.
		// // We should be left with the base url without the trailing /
		// const baseUrl = current.substring(
		// 	0,
		// 	current.length - this.router.currentRoute.fullPath.length
		// );

		// // If the url we're going to isn't under our base url - hard redirect.
		// if (!href.startsWith(baseUrl)) {
		// 	this.gotoHard(href);
		// 	return;
		// }

		// const routeHref = href.substring(baseUrl.length);

		// // If our router doesn't know how to resolve this url, let the browser try.
		// const matched = this.router.getMatchedComponents(routeHref);
		// if (matched.length === 0 || matched[0].name === 'error.404') {
		// 	this.gotoHard(href);
		// 	return;
		// }

		// console.log('Soft redirecting to ' + routeHref);

		// // If the url we're given is exactly the base url, routeHref will end up being an empty string.
		// // To resolve to the correct route in this case, we need to pass /
		// this.router.push(routeHref || '/');
	}

	static gotoExternal(href: string) {
		if (GJ_IS_CLIENT) {
			nw.Shell.openExternal(href);
		} else {
			this.goto(href);
		}
	}

	static newWindow(url: string) {
		if (GJ_IS_CLIENT) {
			Navigate.gotoExternal(url);
		} else {
			window.open(url, '_blank');
		}
	}
}
