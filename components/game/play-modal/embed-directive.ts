import { Component, Inject, Input, ViewChild, AfterViewInit } from 'ng-metadata/core';
import { App } from './../../../../../app/app-service';
import template from 'html!./embed.html';

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
		@Inject( '$element' ) private $element: angular.IRootElementService,
		@Inject( '$sce' ) private $sce: angular.ISCEService,
		@Inject( '$q' ) private $q: angular.IQService,
		@Inject( '$interval' ) private $interval: angular.IIntervalService,
		@Inject( 'Environment' ) private environment: any,
		@Inject( 'Game_PlayModal' ) playModal: any,
		@Inject( 'Game_Build' ) gameBuild: any,
		@Inject( 'Api' ) private api: any,
		@Inject( 'App' ) private app: App
	)
	{
		const elem: HTMLElement = $element[0];

		elem.classList.add( 'game-play-modal-embed' );

		if ( this.build.type == gameBuild.TYPE_ROM ) {

			if ( this.build.emulator_type == gameBuild.EMULATOR_GB || this.build.emulator_type == gameBuild.EMULATOR_GBC ) {
				this.embedWidth = 160 * 4;
				this.embedHeight = 144 * 4;
			}
			else if ( this.build.emulator_type == gameBuild.EMULATOR_GBA ) {
				this.embedWidth = 240 * 3;
				this.embedHeight = 160 * 3;
			}
			else if ( this.build.emulator_type == gameBuild.EMULATOR_NES ) {
				this.embedWidth = 256 * 2;
				this.embedHeight = 240 * 2;
			}
			else if ( this.build.emulator_type == gameBuild.EMULATOR_VBOY ) {
				this.embedWidth = 384 * 2;
				this.embedHeight = 224;
			}
			else if ( this.build.emulator_type == gameBuild.EMULATOR_GENESIS ) {
				this.embedWidth = 320 * 2;
				this.embedHeight = 224 * 2;
			}
			else if ( this.build.emulator_type == gameBuild.EMULATOR_SNES ) {
				this.embedWidth = 320 * 2;
				this.embedHeight = 224 * 2;
			}
			else if ( this.build.emulator_type == gameBuild.EMULATOR_C64 ) {
				this.embedWidth = 418 * 2;
				this.embedHeight = 235 * 2;
			}
			else if ( this.build.emulator_type == gameBuild.EMULATOR_ZX ) {
				this.embedWidth = 352 * 2;
				this.embedHeight = 296 * 2;
			}
			else if ( this.build.emulator_type == gameBuild.EMULATOR_ATARI2600 ) {
				this.embedWidth = 176 * 3;
				this.embedHeight = 223 * 3;
			}
		}
		else {
			this.embedWidth = this.build.embed_width;
			this.embedHeight = this.build.embed_height;
		}

		elem.style.width = `${this.embedWidth}px`;
		elem.style.height = `${this.embedHeight}px`;
	}

	ngAfterViewInit()
	{
		this.$q.when()
			.then( () =>
			{
				if ( this.app.user ) {
					return this.api.sendRequest( '/web/dash/token' );
				}
			} )
			.then( response =>
			{
				let src = `${this.environment.gameserverUrl}/view/${this.build.id}`;
				let queryParams = [];

				if ( response && response.token ) {
					queryParams.push( `username=${this.app.user.username}` );
					queryParams.push( `token=${response.token}` );
				}

				src += '?' + queryParams.join( '&' );
				this.src = this.$sce.trustAsResourceUrl( src );
			} )
			.then( () =>
			{
				// This is mainly for emulators.
				// It's so hard to focus it correctly.
				// Spam it!
				this.$interval( () =>
				{
					this.focus();
				}, 2000 );
			} );
	}

	focus()
	{
		const gameFrame: HTMLElement = this.$element[0].querySelector( '#online-game-frame' );
		if ( gameFrame ) {
			gameFrame.focus();
		}
	}
}
