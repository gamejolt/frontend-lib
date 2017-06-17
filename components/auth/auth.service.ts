import { Environment } from '../environment/environment.service';

export class Auth {
	static redirectDashboard() {
		// This is mainly for client.
		// It tells the intro animation that it should play the intro even if it can't find a user.
		window.sessionStorage.setItem('client-intro-login-play', 'play');
		window.location.href = Environment.wttfBaseUrl + '/dashboard';
	}
}
