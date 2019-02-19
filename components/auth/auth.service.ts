import SectionService from '../../../../_common/sections/section.service';
import { Environment } from '../environment/environment.service';
import { Navigate } from '../navigate/navigate.service';

export class Auth {
	static redirectNewUserFlow() {
		if (GJ_IS_SSR) {
			return;
		}

		// This is mainly for client.
		// It tells the intro animation that it should play the intro even if it can't find a user.
		window.sessionStorage.setItem('client-intro-login-play', 'play');
		SectionService.redirectTo('new-user.avatar');
	}

	static redirectDashboard() {
		if (GJ_IS_SSR) {
			return;
		}

		// This is mainly for client.
		// It tells the intro animation that it should play the intro even if it can't find a user.
		window.sessionStorage.setItem('client-intro-login-play', 'play');
		Navigate.goto(Environment.baseUrl);
	}
}
