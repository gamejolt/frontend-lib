import { Modal } from '../../modal/modal.service';
import { asyncComponentLoader } from '../../../utils/utils';
import { HistoryTick } from '../../history-tick/history-tick-service';
import { Popover } from '../../popover/popover.service';
import { Device } from '../../device/device.service';
import { Game } from '../game.model';
import { GameBuild } from '../build/build.model';
import { Analytics } from '../../analytics/analytics.service';
import { Environment } from '../../environment/environment.service';
import { Growls } from '../../growls/growls.service';
import { Translate } from '../../translate/translate.service';

export class GamePlayModal
{
	static hasModal = false;
	static canMinimize = false;

	static init( options: { canMinimize?: boolean } )
	{
		this.canMinimize = options.canMinimize || false;
	}

	static async show( game: Game, build: GameBuild, options: { key?: string } = {} )
	{
		Analytics.trackEvent( 'game-play', 'play' );

		if ( this.hasModal ) {
			Growls.error(
				Translate.$gettext( `You already have a browser game open. You can only have one running at a time.` ),
			);
			return;
		}

		HistoryTick.sendBeacon( 'game-build', build.id, {
			sourceResource: 'Game',
			sourceResourceId: game.id,
			key: options.key,
		} );

		// If they clicked into this through a popover.
		Popover.hideAll();

		// Will open the gameserver in their browser.
		if ( GJ_IS_CLIENT && build.type !== GameBuild.TYPE_HTML && build.type !== GameBuild.TYPE_ROM ) {
			const gui = require( 'nw.gui' );
			const url = await this.getDownloadUrl( build, { key: options.key } );
			gui.Shell.openExternal( url );
			return;
		}

		// Safari doesn't allow you to set cookies on a domain that isn't the
		// same as the current domain. That means our cookie signing breaks in
		// the iframe. To fix we have to open a new tab to the gameserver.
		if ( Device.browser().indexOf( 'Safari' ) !== -1 ) {

			// We have to open the window first before getting the URL. The
			// browser will block the popup unless it's done directly in the
			// onclick handler. Once we have the download URL we can direct the
			// window that we now have the reference to.
			const win = window.open( '' );
			const url = await this.getDownloadUrl( build, { key: options.key } );
			win.location.href = url;
			return;
		}

		this.hasModal = true;
		const url = await this.getDownloadUrl( build, { key: options.key } );
		const canMinimize = this.canMinimize;

		await Modal.show( {
			component: () => asyncComponentLoader( $import( './play-modal' ) ),
			props: { game, build, url, canMinimize },
			noBackdrop: true,
			noBackdropClose: true,
			noEscClose: true,
		} );

		this.hasModal = false;
	}

	private static async getDownloadUrl( build: GameBuild, options: { key?: string } )
	{
		const payload = await build.getDownloadUrl( { key: options.key } );
		let url = payload.url;

		// TODO: Get rid of this once we switch to https-only.
		if ( !Environment.isSecure ) {
			url = url.replace( 'https://', 'http://' );
		}

		return url;
	}
}
