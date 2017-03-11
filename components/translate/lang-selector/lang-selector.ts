import * as Vue from 'vue';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./lang-selector.html?style=./lang-selector.styl';

import { Analytics } from '../../analytics/analytics.service';
import { Translate } from '../translate.service';
import { stringSort } from '../../../utils/array';

@View
@Component({
	name: 'translate-lang-selector',
})
export class AppTranslateLangSelector extends Vue
{
	lang = Translate.lang;

	get langs()
	{
		return Translate.langs.sort( ( a, b ) => stringSort( a.label, b.label ) );
	}

	async onChange()
	{
		console.log( 'lang changed', this.lang );
		await Analytics.trackEvent( 'translations', 'change', this.lang );

		// We don't wait for the promise to resolve before firing the event.
		// This way they can reload the window without any language flicker.
		Translate.setLanguage( this.lang );
		this.$emit( 'changed', this.lang );
	}
}
