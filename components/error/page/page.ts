import Vue from 'vue';
import { State } from 'vuex-class';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./page.html?style=./page.styl';

import { AppStore } from '../../../vue/services/app/app-store';
import { ErrorPages } from './page-components';

@View
@Component({})
export class AppErrorPage extends Vue
{
	@State app: AppStore;

	get page()
	{
		if ( this.app.error ) {
			return ErrorPages[ this.app.error ];
		}
	}
}
