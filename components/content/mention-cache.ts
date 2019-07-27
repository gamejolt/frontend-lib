import { User } from 'game-jolt-frontend-lib/components/user/user.model';
import { Route } from 'vue-router/types/router';
import { arrayRemove } from '../../utils/array';
import { ContentDocument } from './content-document';

export type MentionCacheUser = {
	user: User;
	source: string;
	rank: number;
};

export class MentionCache {
	private static _currentRoute: Route | null = null;
	private static _users: MentionCacheUser[] = [];

	private static _bustCache(fromRoute: Route) {
		console.log('bust cache for', fromRoute.fullPath);
		this._currentRoute = fromRoute;
		this._users = [];
	}

	private static _removeBySource(source: string) {
		arrayRemove(this._users, i => i.source === source);
	}

	private static _addUser(user: User, source: string) {
		const currentUser = this._users.find(i => i.user.id === user.id);
		if (currentUser) {
			console.log(
				'increase user',
				currentUser.user.username,
				'to rank',
				currentUser.rank + 1
			);
			currentUser.rank++;
		} else {
			console.log('add user', user.username, 'with rank 1');
			this._users.push({ user, rank: 1, source });
		}
	}

	public static add(fromRoute: Route, source: string, ...users: User[]) {
		if (this._currentRoute === null || this._currentRoute.fullPath !== fromRoute.fullPath) {
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

	public static getUsers(suggestion: string) {
		return this._users;
	}
}
