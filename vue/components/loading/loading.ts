import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./loading.html?style=./loading.styl';

import { importContext } from '../../../utils/utils';

@View
@Component({})
export class AppLoading extends Vue
{
	@Prop( { type: String, default: 'Loading...' } ) label: string;
	@Prop( Boolean ) hideLabel: boolean;
	@Prop( Boolean ) big: boolean;
	@Prop( Boolean ) noColor: boolean;
	@Prop( Boolean ) stationary: boolean;
	@Prop( Boolean ) centered: boolean;

	images = importContext( require.context( '../../../components/loading/', false, /\.gif$/ ) );

	get img()
	{
		const img = 'loading'
			+ (this.stationary ? '-stationary' : '')
			+ (this.noColor ? '-bw' : '')
			+ (this.big ? '-2x' : '')
			;

		return this.images[`./${img}.gif`];
	}
}
