import { Component, Input, Inject } from '@angular/core';
import { Youtube_Sdk } from './../sdk/sdk-service';

@Component({
	selector: 'gj-social-youtube-subscribe',
	template: `
	<div class="g-ytsubscribe" data-channelid="{{ ::$ctrl.channel }}" data-layout="{{ ::$ctrl.layout }}" data-theme="{{ ::$ctrl.theme }}" data-count="default"></div>
	`,
})
export class SubscribeComponent
{
	@Input( '@' ) channel: string;
	@Input( '@?' ) layout?: string;
	@Input( '@?' ) theme?: string;

	constructor(
		@Inject( 'Youtube_Sdk' ) private sdk: Youtube_Sdk
	)
	{
		if ( !this.layout ) {
			this.layout = 'default';
		}

		if ( !this.theme ) {
			this.theme = 'default';
		}
	}

	$postLink()
	{
		this.sdk.load();
	}
}
