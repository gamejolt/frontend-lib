import { transparentize } from 'polished';
import Vue, { CreateElement } from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { Theme } from './theme.model';
import { ThemeState, ThemeStore } from './theme.store';

let inc = 0;

@Component({})
export class AppTheme extends Vue {
	@Prop(Theme)
	theme!: Theme | null;

	@Prop(Boolean)
	forceDark!: boolean;

	@Prop(Boolean)
	forceLight!: boolean;

	@ThemeState
	isDark!: ThemeStore['isDark'];

	@ThemeState('theme')
	storeTheme!: ThemeStore['theme'];

	scopeId = ++inc;

	render(h: CreateElement) {
		const id = 'theme-' + this.scopeId;
		const selector = this.$slots.default ? '#' + id : ':root';
		let styles = '';

		const theme = this.theme || this.storeTheme || new Theme();

		styles += `
			${selector} {
				--theme-white: #fff;
				--theme-darkest: #${theme.darkest_};
				--theme-darker: #${theme.darker_};
				--theme-dark: #${theme.dark_};
				--theme-gray: #${theme.gray_};
				--theme-gray-subtle: #${theme.graySubtle_};
				--theme-light: #${theme.light_};
				--theme-lighter: #${theme.lighter_};
				--theme-lightest: #${theme.lightest_};
				--theme-black: #000;
				--theme-bg-backdrop-light: #${theme.bgBackdrop_};
				--theme-bg-backdrop-light-trans: ${transparentize(1, '#' + theme.bgBackdrop_)};
				--theme-bg-backdrop-dark: #${theme.darkBgBackdrop_};
				--theme-bg-backdrop-dark-trans: ${transparentize(1, '#' + theme.darkBgBackdrop_)};

				--theme-black-trans: ${transparentize(1, '#000')};
				--theme-darkest-trans: ${transparentize(1, '#' + theme.darkest_)};
				--theme-darker-trans: ${transparentize(1, '#' + theme.darker_)};
				--theme-dark-trans: ${transparentize(1, '#' + theme.dark_)};
				--theme-gray-trans: ${transparentize(1, '#' + theme.gray_)};
				--theme-gray-subtle-trans: ${transparentize(1, '#' + theme.graySubtle_)};
				--theme-light-trans: ${transparentize(1, '#' + theme.light_)};
				--theme-lighter-trans: ${transparentize(1, '#' + theme.lighter_)};
				--theme-lightest-trans: ${transparentize(1, '#' + theme.lightest_)};
				--theme-white-trans: ${transparentize(1, '#fff')};

				--theme-highlight: #${theme.highlight_};
				--theme-backlight: #${theme.backlight_};
				--theme-notice: #${theme.notice_};
				--theme-highlight-fg: #${theme.highlightFg_};
				--theme-notice-fg: #${theme.noticeFg_};
				--theme-bi-bg: #${theme.biBg_};
				--theme-bi-fg: #${theme.biFg_};
				--theme-bg: var(--theme-white);
				--theme-bg-trans: var(--theme-white-trans);
				--theme-bg-offset-base: var(--theme-lightest);
				--theme-bg-offset-trans-base: var(--theme-lightest-trans);
				--theme-bg-offset: var(--theme-bg-offset-base);
				--theme-bg-offset-trans: var(--theme-bg-offset-trans-base);
				--theme-bg-backdrop: var(--theme-bg-backdrop-light);
				--theme-bg-backdrop-trans: var(--theme-bg-backdrop-light-trans);
				--theme-bg-subtle: var(--theme-lighter);
				--theme-fg: var(--theme-dark);
				--theme-fg-muted: var(--theme-light);
				--theme-link: var(--theme-backlight);
				--theme-link-hover: var(--theme-black);

				--dark-theme-highlight: #${theme.darkHighlight_};
				--dark-theme-backlight: #${theme.darkBacklight_};
				--dark-theme-notice: #${theme.darkNotice_};
				--dark-theme-bi-bg: #${theme.darkBiBg_};
				--dark-theme-bi-fg: #${theme.darkBiFg_};
				--dark-theme-bg: var(--theme-dark);
				--dark-theme-bg-trans: var(--theme-dark-trans);
				--dark-theme-bg-offset-base: var(--theme-darker);
				--dark-theme-bg-offset-trans-base: var(--theme-gray-trans);
				--dark-theme-bg-offset: var(--dark-theme-bg-offset-base);
				--dark-theme-bg-offset-trans: var(--dark-theme-bg-offset-trans-base);
				--dark-theme-bg-backdrop: var(--theme-bg-backdrop-dark);
				--dark-theme-bg-backdrop-trans: var(--theme-bg-backdrop-dark-trans);
				--dark-theme-bg-subtle: var(--theme-gray-subtle);
				--dark-theme-fg: var(--theme-lightest);
				--dark-theme-fg-muted: var(--theme-light);
				--dark-theme-link: #${theme.darkHighlight_};
				--dark-theme-link-hover: var(--theme-white);
			}
		`;

		if ((this.isDark && !this.forceLight) || this.forceDark) {
			// Sync with the theme-dark() stylus mixin.
			styles += `
				${selector} {
					--theme-highlight: var(--dark-theme-highlight);
					--theme-backlight: var(--dark-theme-backlight);
					--theme-notice: var(--dark-theme-notice);
					--theme-bi-bg: var(--dark-theme-bi-bg);
					--theme-bi-fg: var(--dark-theme-bi-fg);
					--theme-bg: var(--dark-theme-bg);
					--theme-bg-trans: var(--dark-theme-bg-trans);
					--theme-bg-offset-base: var(--dark-theme-bg-offset-base);
					--theme-bg-offset-trans-base: var(--dark-theme-bg-offset-trans-base);
					--theme-bg-offset: var(--dark-theme-bg-offset);
					--theme-bg-offset-trans: var(--dark-theme-bg-offset-trans);
					--theme-bg-backdrop: var(--dark-theme-bg-backdrop);
					--theme-bg-backdrop-trans: var(--dark-theme-bg-backdrop-trans);
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
