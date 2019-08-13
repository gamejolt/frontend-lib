import { User } from 'game-jolt-frontend-lib/components/user/user.model';
import { fuzzysearch } from 'game-jolt-frontend-lib/utils/string';
import { Route } from 'vue-router/types/router';
import { ContentDocument } from './content-document';

export type MentionCacheUser = {
	user: User;
	source: string;
	rank: number;
	match: number;
};

export class MentionCache {
	private static _currentRoute: Route | null = null;
	private static _users: MentionCacheUser[] = [];

	private static _isDifferentRoute(route: Route) {
		return this._currentRoute === null || this._currentRoute.fullPath !== route.fullPath;
	}

	private static _bustCache(fromRoute: Route) {
		this._currentRoute = fromRoute;
		this._users = [];
	}

	private static _removeBySource(source: string) {
		this._users = this._users.filter(i => i.source !== source);
	}

	private static _addUser(user: User, source: string) {
		const currentUser = this._users.find(i => i.user.id === user.id);
		if (currentUser) {
			currentUser.rank++;
		} else {
			this._users.push({ user, rank: 1, source, match: 0 });
		}
	}

	public static add(fromRoute: Route, source: string, ...users: User[]) {
		if (this._isDifferentRoute(fromRoute)) {
			this._bustCache(fromRoute);
		} else {
			this._removeBySource(source);
		}

		for (const user of users) {
			this._addUser(user, source);
		}
	}

	public static addFromDoc(fromRoute: Route, source: string, doc: ContentDocument) {
		const mentions = doc.getMarks('mention');
		const users = [];
		for (const mention of mentions) {
			const username = mention.attrs.username;
			const hydration = doc.hydration.find(
				i => i.type === 'username' && i.source === username
			);
			if (hydration && hydration.data) {
				const user = new User(hydration.data);
				users.push(user);
			}
		}
		this.add(fromRoute, source, ...users);
	}

	public static getUsers(fromRoute: Route, suggestion: string) {
		if (this._isDifferentRoute(fromRoute)) {
			this._bustCache(fromRoute);
		}

		for (const user of this._users) {
			user.match = this.calculateUserMatch(suggestion, user);
		}

		return this._users.filter(i => i.match >= 1);
	}

	public static calculateUserMatch(suggestion: string, user: MentionCacheUser): number {
		const query = suggestion.toLowerCase();
		let match = 0;

		const fuzzyUsername = fuzzysearch(query, user.user.username.toLowerCase());
		const fuzzyDisplayName = fuzzysearch(query, user.user.display_name.toLowerCase());

		if (!fuzzyUsername && !fuzzyDisplayName) {
			return 0;
		}

		// For short usernames we don't want this
		if (user.user.display_name.length > 3) {
			if (user.user.display_name.toLowerCase() === suggestion) {
				match += 2;
			} else if (fuzzyDisplayName) {
				match++;
			}
		}
		if (user.user.username.length > 3) {
			if (user.user.username.toLowerCase() === suggestion) {
				match += 2;
			} else if (fuzzyUsername) {
				match++;
			}
		}

		if (user.user.is_verified) {
			match++;
		}

		if (user.user.is_following) {
			match++;
		}

		match += user.rank;
		match += user.user.follower_count / 500;

		return match;
	}
}
