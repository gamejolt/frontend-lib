import { ContextCapabilities } from 'game-jolt-frontend-lib/components/content/content-context';
import { ContentHydrator } from 'game-jolt-frontend-lib/components/content/content-hydrator';
import { ContentOwner } from 'game-jolt-frontend-lib/components/content/content-owner';
import { Environment } from 'game-jolt-frontend-lib/components/environment/environment.service';

type EmbedData = {
	type: EmbedType;
	source: string;
};

type EmbedType =
	| 'game-jolt-community'
	| 'game-jolt-user'
	| 'game-jolt-game'
	| 'youtube-video'
	| 'soundcloud-song';

export class ContentEmbedService {
	public static async getEmbedData(
		owner: ContentOwner,
		input: string
	): Promise<EmbedData | undefined> {
		input = input.trim();
		const lines = input.split(/\r?\n/);

		// Figure out what kind of link/embed has been pasted
		// Go through all lines of pasted content individually
		// This also has to take capabilities into account

		const capabilities = owner.getCapabilities();
		const hydrator = owner.getHydrator();
		for (const line of lines) {
			const gameJoltCommunityPath = this.tryGameJoltCommunity(capabilities, line);
			if (gameJoltCommunityPath !== false) {
				return { type: 'game-jolt-community', source: gameJoltCommunityPath };
			}

			const gameJoltUsername = this.tryGameJoltUser(capabilities, line);
			if (gameJoltUsername !== false) {
				return { type: 'game-jolt-user', source: gameJoltUsername };
			}

			const gameJoltGameId = this.tryGameJoltGame(capabilities, line);
			if (gameJoltGameId !== false) {
				return { type: 'game-jolt-game', source: gameJoltGameId };
			}

			const youtubeVideoId = this.tryYouTube(capabilities, line);
			if (youtubeVideoId !== false) {
				return { type: 'youtube-video', source: youtubeVideoId };
			}

			const soundcloudSongId = await this.trySoundCloud(capabilities, hydrator, line);
			if (soundcloudSongId !== false) {
				return { type: 'soundcloud-song', source: soundcloudSongId };
			}
		}
	}

	private static tryGameJoltCommunity(capabilities: ContextCapabilities, input: string) {
		if (!capabilities.embedCommunity) {
			return false;
		}

		// gamejolt.com/c/path
		const results = /gamejolt.com\/c\/([a-z0-9-_]{1,50})/i.exec(input);
		if (results !== null && results.length === 2) {
			const communityPath = results[1];
			return communityPath;
		}

		return false;
	}
	private static tryGameJoltUser(capabilities: ContextCapabilities, input: string) {
		if (!capabilities.embedUser) {
			return false;
		}

		// gamejolt.com/@username
		const results = /gamejolt.com\/@([a-z0-9]{1,30})/i.exec(input);
		if (results !== null && results.length === 2) {
			const username = results[1];
			return username;
		}

		return false;
	}

	private static tryGameJoltGame(capabilities: ContextCapabilities, input: string) {
		if (!capabilities.embedGame) {
			return false;
		}

		// gamejolt.com/games/name/id
		const results = /gamejolt.com\/games\/.+?\/([0-9]+)/i.exec(input);
		if (results !== null && results.length === 2) {
			const gameId = parseInt(results[1]);
			if (gameId !== NaN) {
				return gameId.toString();
			}
		}

		return false;
	}

	private static tryYouTube(capabilities: ContextCapabilities, input: string) {
		if (!capabilities.embedVideo) {
			return false;
		}

		// Support:
		// youtube.com/watch -> v=id
		// m.youtube.com/watch -> v=id

		try {
			const url = new URL(input);
			if (/(.+\.)?youtube\.com/i.test(url.hostname)) {
				const videoId = url.searchParams.get('v');
				if (videoId !== null && videoId.length === 11) {
					return videoId;
				}
			}
		} catch (error) {
			// Swallow error. new Url throws on invalid URLs, which can very well happen.
		}

		return false;
	}

	private static async trySoundCloud(
		capabilities: ContextCapabilities,
		hydrator: ContentHydrator,
		input: string
	) {
		if (!capabilities.embedMusic) {
			return false;
		}

		const results = /soundcloud.com\/(.+?\/.+)/i.exec(input);
		if (results !== null && results.length === 2) {
			const trackUrlPart = results[1];
			const trackUrl = 'https://soundcloud.com/' + trackUrlPart;
			const data = await hydrator.getData('soundcloud-track-url', trackUrl);
			if (data !== null && data.trackId) {
				return data.trackId.toString();
			}
		}

		return false;
	}

	/**
	 * Returns the external url for a type + source that links to the origin of the embed content.
	 */
	public static async getSourceUrl(
		type: string,
		source: string,
		hydrator: ContentHydrator
	): Promise<string | undefined> {
		switch (type) {
			case 'game-jolt-game':
				return Environment.baseUrl + '/games/game/' + source;
			case 'game-jolt-user':
				return Environment.baseUrl + '/@' + source;
			case 'game-jolt-community':
				return Environment.baseUrl + '/c/' + source;
			case 'youtube-video':
				return 'https://www.youtube.com/watch?v=' + source;
			case 'soundcloud-song':
				const data = await hydrator.getData('soundcloud-track-id', source);
				if (data && data.url) {
					return data.url;
				}
		}
		return undefined;
	}
}
