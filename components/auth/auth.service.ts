import { Environment } from '../environment/environment.service';
import { Navigate } from '../navigate/navigate.service';

export class Auth {
	static redirectDashboard() {
		if (GJ_IS_SSR) {
			return;
		}

		// This is mainly for client.
		// It tells the intro animation that it should play the intro even if it can't find a user.
		window.sessionStorage.setItem('client-intro-login-play', 'play');
		Navigate.goto(Environment.wttfBaseUrl);
	}
}
