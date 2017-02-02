import { Component, Inject, Input, AfterViewInit } from 'ng-metadata/core';
import { App } from '../../../../../app/app-service';
import { Environment } from '../../environment/environment.service';
import * as template from '!html-loader!./embed.html';
import { GameBuild } from '../build/build.model';
import { Api } from '../../api/api.service';

@Component({
	selector: 'gj-game-play-modal-embed',
	template,
})
export class EmbedComponent implements AfterViewInit
{
	token: string;
	src: string;
	embedWidth: number;
	embedHeight: number;

	@Input( '<' ) build: any;

	constructor(
		@Inject( '$element' ) private $element: ng.IRootElementService,
		@Inject( '$sce' ) private $sce: ng.ISCEService,
		@Inject( '$interval' ) private $interval: ng.IIntervalService,
		@Inject( 'App' ) private app: App
	)
	{
		const elem: HTMLElement = $element[0];

		elem.classList.add( 'game-play-modal-embed' );

		if ( this.build.type == GameBuild.TYPE_ROM ) {

			if ( this.build.emulator_type == GameBuild.EMULATOR_GB || this.build.emulator_type == GameBuild.EMULATOR_GBC ) {
				this.embedWidth = 160 * 4;
				this.embedHeight = 144 * 4;
			}
			else if ( this.build.emulator_type == GameBuild.EMULATOR_GBA ) {
				this.embedWidth = 240 * 3;
				this.embedHeight = 160 * 3;
			}
			else if ( this.build.emulator_type == GameBuild.EMULATOR_NES ) {
				this.embedWidth = 256 * 2;
				this.embedHeight = 240 * 2;
			}
			else if ( this.build.emulator_type == GameBuild.EMULATOR_VBOY ) {
				this.embedWidth = 384 * 2;
				this.embedHeight = 224;
			}
			else if ( this.build.emulator_type == GameBuild.EMULATOR_GENESIS ) {
				this.embedWidth = 320 * 2;
				this.embedHeight = 224 * 2;
			}
			else if ( this.build.emulator_type == GameBuild.EMULATOR_SNES ) {
				this.embedWidth = 256 * 2;
				this.embedHeight = 224 * 2;
			}
			else if ( this.build.emulator_type == GameBuild.EMULATOR_ATARI2600 ) {
				this.embedWidth = 176 * 3;
				this.embedHeight = 223 * 3;
			}
			else if ( this.build.emulator_type == GameBuild.EMULATOR_C64 ) {
				this.embedWidth = 418 * 2;
				this.embedHeight = 235 * 2;
			}
			else if ( this.build.emulator_type == GameBuild.EMULATOR_ZX ) {
				this.embedWidth = 352 * 2;
				this.embedHeight = 296 * 2;
			}
			else if ( this.build.emulator_type == GameBuild.EMULATOR_CPC ) {
				this.embedWidth = 384 * 2;
				this.embedHeight = 272 * 2;
			}
			else if ( this.build.emulator_type == GameBuild.EMULATOR_MSX ) {
				this.embedWidth = 272 * 2;
				this.embedHeight = 233 * 2;
			}
		}
		else {
			this.embedWidth = this.build.embed_width;
			this.embedHeight = this.build.embed_height;
		}

		elem.style.width = `${this.embedWidth}px`;
		elem.style.height = `${this.embedHeight}px`;
	}

	async ngAfterViewInit()
	{
		let response: any;
		if ( this.app.user ) {
			response = await Api.sendRequest( '/web/dash/token' );
		}

		let src = `${Environment.gameserverUrl}/gameserver/view/${this.build.id}`;
		let queryParams: string[] = [];

		if ( response && response.token ) {
			queryParams.push( `username=${this.app.user!.username}` );
			queryParams.push( `token=${response.token}` );
		}

		src += '?' + queryParams.join( '&' );
		this.src = this.$sce.trustAsResourceUrl( src );

		// This is mainly for emulators.
		// It's so hard to focus it correctly.
		// Spam it!
		this.$interval( () =>
		{
			this.focus();
		}, 2000 );
	}

	focus()
	{
		const gameFrame: HTMLElement = <any>this.$element[0].querySelector( '#online-game-frame' );
		if ( gameFrame ) {
			gameFrame.focus();
		}
	}
}
