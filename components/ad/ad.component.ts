import { Component, Input, OnInit, OnDestroy, Inject } from 'ng-metadata/core';
import * as template from '!html-loader!./ad.component.html';
import './ad.styl';

import { AdSlot, Ads } from './ads.service';
import { isPrerender } from '../environment/environment.service';
import { Model } from '../model/model.service';
import { Game } from '../game/game.model';
import { User } from '../user/user.model';
import { FiresidePost } from '../fireside/post/post-model';

@Component({
	selector: 'gj-ad',
	template,
})
export class AdComponent implements OnInit, OnDestroy
{
	@Input() size: 'rectangle' | 'leaderboard' = 'rectangle';
	@Input() slotId = '';
	@Input() resource?: Model;

	slot?: AdSlot;
	private isDestroyed = false;

	constructor(
		@Inject( '$scope' ) public $scope: ng.IScope,
		@Inject( 'DoubleClick' ) public DoubleClick: any,
	)
	{
	}

	ngOnInit()
	{
		if (
			GJ_IS_CLIENT
			|| isPrerender
			|| (this.resource && this.resource instanceof Game && !this.resource._should_show_ads)
		) {
			return;
		}

		let resource = undefined;
		let resourceId = undefined;

		if ( this.resource instanceof Game ) {
			resource = 'Game';
			resourceId = this.resource.id;
		}
		else if ( this.resource instanceof User ) {
			resource = 'User';
			resourceId = this.resource.id;
		}
		else if ( this.resource instanceof FiresidePost ) {
			resource = 'Fireside_Post';
			resourceId = this.resource.id;
		}

		Ads.sendBeacon( Ads.TYPE_DISPLAY, resource, resourceId );

		this.slot = Ads.getUnusedAdSlot( this.size );
		if ( this.slot ) {
			this.slot.isUsed = true;
		}

		// When the state changes we want to refresh this ad if the scope hasn't
		// been destroyed. This is for ads that are in a parent state outside
		// the changed view.
		this.$scope.$on( '$stateChangeSuccess', () =>
		{
			// We need the destroyed event to trigger first. Setting a timeout
			// to 0 will cause it to run on next loop which will push this event
			// past any destroyed event that may happen.
			setTimeout( () =>
			{
				if ( this.isDestroyed || !this.slot ) {
					return;
				}

				this.DoubleClick.refreshAds( this.slot.id );
			}, 0 );
		} );
	}

	ngOnDestroy()
	{
		if ( this.slot ) {
			this.slot.isUsed = false;
		}
		this.isDestroyed = true;
	}
}
