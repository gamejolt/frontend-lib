import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import * as nwGui from 'nw.gui';
import * as View from '!view!./lang-selector.html?style=./lang-selector.styl';

import { Analytics } from '../../analytics/analytics.service';
import { getTranslationLang, TranslationLangs, setTranslationLang } from '../translate.service';
import { stringSort } from '../../../utils/array';

@View
@Component({})
export class AppTranslateLangSelector extends Vue {
	lang = getTranslationLang();

	get langs() {
		return TranslationLangs.sort((a, b) => stringSort(a.label, b.label));
	}

	async onChange() {
		await Analytics.trackEvent('translations', 'change', this.lang);

		setTranslationLang(this.lang);

		// We have to refresh the whole browser when language changes so that
		// all the new language strings get picked up.
		if (!GJ_IS_CLIENT) {
			window.location.reload();
		} else {
			const gui = require('nw.gui') as typeof nwGui;
			gui.Window.get().reloadDev();
		}
	}
}
