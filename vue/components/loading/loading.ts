import * as Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./loading.html?style=./loading.styl';

import { importContext } from '../../../utils/utils';

@View
@Component({
	name: 'loading',
})
export class AppLoading extends Vue
{
	@Prop( { default: 'Loading...' } ) label: string;
	@Prop() hideLabel: boolean;
	@Prop() big: boolean;
	@Prop() noColor: boolean;
	@Prop() stationary: boolean;
	@Prop() centered: boolean;

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
