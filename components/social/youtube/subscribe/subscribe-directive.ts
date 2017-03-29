import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { YoutubeSdk } from '../sdk/sdk.service';

@Component({
	name: 'social-youtube-subscribe',
})
export class AppSocialYoutubeSubscribe extends Vue
{
	@Prop( String ) channel: string;
	@Prop( { type: String, default: 'default' } ) layout: string;
	@Prop( { type: String, default: 'default' } ) theme: string;

	render( h: Vue.CreateElement )
	{
		return h(
			'div',
			{
				staticClass: 'g-ytsubscribe',
				attrs: {
					'data-channelid': this.channel,
					'data-layout': this.layout,
					'data-theme': this.theme,
					'data-count': 'default',
				},
			},
		);
	}

	mounted()
	{
		YoutubeSdk.load();
	}
}
