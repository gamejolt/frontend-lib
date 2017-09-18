import * as nwGui from 'nw.gui';
import VueRouter from 'vue-router';
import { Game } from '../game.model';
import { GameBuild } from '../build/build.model';
import { Analytics } from '../../analytics/analytics.service';
import { HistoryTick } from '../../history-tick/history-tick-service';
import { Growls } from '../../growls/growls.service';
import { Translate } from '../../translate/translate.service';
import { Popover } from '../../popover/popover.service';
import { Environment } from '../../environment/environment.service';

export interface GameDownloaderOptions {
	key?: string;
	isOwned?: boolean;
}

export class GameDownloader {
	static isDownloadQueued = false;
	static shouldTransition = false;

	static async download(
		router: VueRouter,
		game: Game,
		build: GameBuild,
		options: GameDownloaderOptions = {}
	) {
		Analytics.trackEvent('game-play', 'download');

		// In case any popover was used to click the download.
		Popover.hideAll();

		// Any time we transition away from the page, make sure we reset our
		// download transition. This will ensure the download won't start.
		let deregister: Function | undefined = router.beforeEach((_to, _from, next) => {
			GameDownloader.shouldTransition = false;
			if (deregister) {
				deregister();
				deregister = undefined;
			}
			next();
		});

		// Client needs to download externally.
		if (GJ_IS_CLIENT) {
			const gui = require('nw.gui') as typeof nwGui;
			gui.Shell.openExternal(
				Environment.baseUrl +
					router.resolve({
						name: 'discover.games.view.download.build',
						params: {
							...game.routeParams,
							buildId: build.id + '',
						},
					}).href
			);
		} else if (
			game.bundle_only ||
			options.key ||
			options.isOwned ||
			(build._package!._sellable && build._package!._sellable!.is_owned)
		) {
			// Bundle-only games can only live in a person's library, or as a key.
			// So if it's bundle-only, or if a key was passed in, go direct. Or, uh,
			// if it is owned.
			// If already waiting on a download, don't do anything.
			if (this.isDownloadQueued) {
				return;
			}

			try {
				// We set this to true and then check it later. If they've
				// navigated to a different route then it will be set to false
				// and we should no longer change their location.
				this.shouldTransition = true;

				// If they click away from the page before the download starts, then cancel the download redirect.
				const response = await build.getDownloadUrl({
					key: options.key || undefined,
					forceDownload: true,
				});

				const downloadUrl = response.downloadUrl;

				// We await so that we're sure the tick has logged.
				await HistoryTick.sendBeacon('game-build', build.id, {
					sourceResource: 'Game',
					sourceResourceId: game.id,
					key: options.key || undefined,
				});

				if (this.shouldTransition) {
					window.location.href = downloadUrl;
				}
			} catch (e) {
				Growls.error(Translate.$gettext(`Couldn't get download URL.`));
			}

			this.isDownloadQueued = false;
		} else {
			router.push({
				name: 'discover.games.view.download.build',
				params: {
					...game.routeParams,
					buildId: build.id + '',
				},
			});
		}
	}
}
