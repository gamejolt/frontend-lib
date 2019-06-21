import Vue, { CreateElement } from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import AppExternalLink from '../../../../vue/components/external-link/external-link.vue';
import { ContentObject } from '../../content-object';
import { ContentOwner } from '../../content-owner';
import AppContentViewerMention from './mention/mention.vue';
import AppContentViewerTag from './tag/tag.vue';

@Component({
	components: {},
})
export class AppContentViewerText extends Vue {
	@Prop(ContentObject)
	data!: ContentObject;
	@Prop(Object)
	owner!: ContentOwner;

	hasMark(mark: string) {
		return this.data.marks && this.data.marks.some(m => m.type === mark);
	}

	getMarkAttrs(mark: string) {
		if (this.hasMark(mark)) {
			return this.data.marks.find(m => m.type === mark)!.attrs;
		}
		return [];
	}

	get text() {
		return this.data.text;
	}

	get isBold() {
		return this.hasMark('strong');
	}

	get isItalics() {
		return this.hasMark('em');
	}

	get isStrikethrough() {
		return this.hasMark('strike');
	}

	get isCode() {
		return this.hasMark('code');
	}

	get isLink() {
		return this.hasMark('link');
	}

	get isMention() {
		return this.hasMark('mention');
	}

	get isTag() {
		return this.hasMark('tag');
	}

	render(h: CreateElement) {
		let vnode = h('span', this.text);
		if (this.isLink) {
			const attrs = this.getMarkAttrs('link');
			const children = [vnode];

			// Make sure the href is prefaced by a protocol.
			let href = attrs.href;
			if (!/^[a-z]{2,10}:\/\/.+/i.test(href)) {
				href = 'https://' + href;
			}

			const elementAttrs = {
				href,
			} as any;
			if (attrs.title) {
				elementAttrs.title = attrs.title;
			}

			vnode = h(AppExternalLink, { attrs: elementAttrs }, children);
		} else if (this.isMention) {
			const attrs = this.getMarkAttrs('mention');
			const children = [vnode];

			vnode = h(
				AppContentViewerMention,
				{ props: { username: attrs.username, owner: this.owner } },
				children
			);
		} else if (this.isTag) {
			const attrs = this.getMarkAttrs('tag');
			const children = [vnode];

			vnode = h(
				AppContentViewerTag,
				{ props: { tag: attrs.tag, owner: this.owner } },
				children
			);
		}

		if (this.isBold) {
			vnode = h('strong', [vnode]);
		}
		if (this.isItalics) {
			vnode = h('em', [vnode]);
		}
		if (this.isStrikethrough) {
			vnode = h('s', [vnode]);
		}
		if (this.isCode) {
			vnode = h('code', [vnode]);
		}
		return vnode;
	}
}
