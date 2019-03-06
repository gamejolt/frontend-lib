import { GJContentObject } from 'game-jolt-frontend-lib/components/content/adapter/definitions';
import Vue, { CreateElement } from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { AppJolticon } from '../../../../vue/components/jolticon/jolticon';

@Component({
	components: {},
})
export class AppContentViewerText extends Vue {
	@Prop(Object)
	data!: GJContentObject;

	hasMark(mark: string) {
		return this.data.marks && this.data.marks.some((m: any) => m.type === mark);
	}

	getMarkAttrs(mark: string) {
		if (this.hasMark(mark)) {
			return this.data.marks.find((m: any) => m.type === mark).attrs;
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

	render(h: CreateElement) {
		let vnode = h('span', { domProps: { innerText: this.text } });
		if (this.isLink) {
			const attrs = this.getMarkAttrs('link');
			const children = [vnode];
			const domProps = {
				href: attrs.href,
			} as any;
			if (attrs.title) {
				domProps.title = attrs.title;
			}
			// TODO: figure out how to detect external links to add an "external link" icon
			if (false) {
				children.push(h(AppJolticon, { props: { icon: 'link' } }));
				domProps.target = '_blank';
			}
			vnode = h('a', { domProps }, children);
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
