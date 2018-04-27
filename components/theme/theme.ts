import Vue, { CreateElement } from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { transparentize } from 'polished';

import { ThemeState, ThemeStore } from './theme.store';
import { ThemeModel } from './theme.model';

let inc = 0;

@Component({})
export class AppTheme extends Vue {
	@ThemeState isDark: ThemeStore['isDark'];
	@ThemeState('theme') storeTheme: ThemeStore['theme'];

	@Prop(Object) theme: any | null;

	scopeId = ++inc;

	render(h: CreateElement) {
		const id = 'theme-' + this.scopeId;
		const selector = this.$slots.default ? '#' + id : ':root';
		let styles = '';

		const theme = this.theme ? ThemeModel.fromPayload(this.theme) : this.storeTheme;

		if (theme) {
			styles += `
				${selector} {
					--theme-white: #fff;
					--theme-darkest: ${theme.darkest};
					--theme-darker: ${theme.darker};
					--theme-dark: ${theme.dark};
					--theme-gray: ${theme.gray};
					--theme-gray-subtle: ${theme.graySubtle};
					--theme-light: ${theme.light};
					--theme-lighter: ${theme.lighter};
					--theme-lightest: ${theme.lightest};
					--theme-black: #000;

					--theme-black-trans: ${transparentize(1, '#000')};
					--theme-darkest-trans: ${transparentize(1, theme.darkest)};
					--theme-darker-trans: ${transparentize(1, theme.darker)};
					--theme-dark-trans: ${transparentize(1, theme.dark)};
					--theme-gray-trans: ${transparentize(1, theme.gray)};
					--theme-gray-subtle-trans: ${transparentize(1, theme.graySubtle)};
					--theme-light-trans: ${transparentize(1, theme.light)};
					--theme-lighter-trans: ${transparentize(1, theme.lighter)};
					--theme-lightest-trans: ${transparentize(1, theme.lightest)};
					--theme-white-trans: ${transparentize(1, '#fff')};

					--theme-highlight: ${theme.highlight};
					--theme-backlight: ${theme.backlight};
					--theme-notice: ${theme.notice};
					--theme-highlight-fg: ${theme.highlightFg};
					--theme-notice-fg: ${theme.noticeFg};
					--theme-bi-bg: ${theme.backlight};
					--theme-bi-fg: ${theme.highlight};
					--theme-bg: var(--theme-white);
					--theme-bg-trans: var(--theme-white-trans);
					--theme-bg-offset: var(--theme-lightest);
					--theme-bg-offset-trans: var(--theme-lightest-trans);
					--theme-bg-subtle: var(--theme-lighter);
					--theme-fg: var(--theme-dark);
					--theme-fg-muted: var(--theme-light);
					--theme-link: var(--theme-backlight);
					--theme-link-hover: var(--theme-black);

					--dark-theme-bi-bg: ${theme.highlight};
					--dark-theme-bi-fg: ${theme.highlightFg};
					--dark-theme-bg: var(--theme-dark);
					--dark-theme-bg-trans: var(--theme-dark-trans);
					--dark-theme-bg-offset: var(--theme-gray);
					--dark-theme-bg-offset-trans: var(--theme-gray-trans);
					--dark-theme-bg-subtle: var(--theme-gray-subtle);
					--dark-theme-fg: var(--theme-lightest);
					--dark-theme-fg-muted: var(--theme-light);
					--dark-theme-link: ${theme.highlight};
					--dark-theme-link-hover: var(--theme-white);
				}
			`;
		}

		if (this.isDark) {
			// Sync with the theme-dark() stylus mixin.
			styles += `
				${selector} {
					--theme-bi-bg: var(--dark-theme-bi-bg);
					--theme-bi-fg: var(--dark-theme-bi-fg);
					--theme-bg: var(--dark-theme-bg);
					--theme-bg-trans: var(--dark-theme-bg-trans);
					--theme-bg-offset: var(--dark-theme-bg-offset);
					--theme-bg-offset-trans: var(--dark-theme-bg-offset-trans);
					--theme-bg-subtle: var(--dark-theme-bg-subtle);
					--theme-fg: var(--dark-theme-fg);
					--theme-fg-muted: var(--dark-theme-fg-muted);
					--theme-link: var(--dark-theme-link);
					--theme-link-hover: var(--dark-theme-link-hover);
				}
			`;
		}

		return h(
			'div',
			{
				domProps: { id: id },
			},
			[h('style', { domProps: { innerHTML: styles } }), this.$slots.default]
		);
	}
}
