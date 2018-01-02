import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import View from '!view!./link.html';

import { isObject } from 'util';

@View
@Component({})
export class AppRouterLink extends Vue {
	/**
	 * The default router-link doesn't encode unicode chars, which breaks on IE. This should fix
	 * special chars in URLs.
	 */
	get sanitizedAttrs() {
		const attrs = Object.assign({}, this.$attrs as any);
		if (attrs.to && isObject(attrs.to)) {
			if (attrs.params && isObject(attrs.params)) {
				Object.keys(attrs.params).forEach(
					k => (attrs.params[k] = encodeURIComponent(attrs.params[k]))
				);
			}

			if (attrs.query && isObject(attrs.query)) {
				Object.keys(attrs.query).forEach(
					k => (attrs.query[k] = encodeURIComponent(attrs.query[k]))
				);
			}
		}

		return attrs;
	}
}
