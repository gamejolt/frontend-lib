type SessionStorageSuggestions = {
	// When user follow suggestions were dismissed.
	// To not bug with suggestions, we limit them to X per interval.
	dismissed: number[];
	[userId: number]: number;
};
const SessionStorageSuggestionsKey = 'user-follow-suggestions';

// How many suggestion dismissals we are allowing per interval.
const MaxSuggestionDismissalsPerDay = 3;

// Whats the interval used to rate limit dismissed suggestions.
const SuggestionRateLimitInterval = 86400000;

export default abstract class UserFollowSuggestion {
	private static get suggestions() {
		const suggestionsStr = sessionStorage.getItem(SessionStorageSuggestionsKey);
		if (suggestionsStr === null) {
			return { dismissed: [] } as SessionStorageSuggestions;
		}

		return JSON.parse(suggestionsStr) as SessionStorageSuggestions;
	}

	private static set suggestions(value: SessionStorageSuggestions) {
		sessionStorage.setItem(SessionStorageSuggestionsKey, JSON.stringify(value));
	}

	static canSuggest(userId: number) {
		let canSuggest = true;
		const now = Date.now();
		const s = this.suggestions;

		// Check if this specific user was already suggested in the past interval.
		const lastSuggested = s[userId] || 0;
		if (now - lastSuggested > SuggestionRateLimitInterval) {
			delete s[userId];
		} else {
			canSuggest = false;
		}

		// Remove old entries from the globally dismissed suggestion times.
		const dismissed = s.dismissed;
		while (dismissed.length > 0 && now - dismissed[0] > SuggestionRateLimitInterval) {
			dismissed.splice(0);
		}

		// Check if after removing the old entries we are still capped.
		if (dismissed.length >= MaxSuggestionDismissalsPerDay) {
			canSuggest = false;
		}

		this.suggestions = s;
		return canSuggest;
	}

	static dontSuggest(userId: number) {
		const s = this.suggestions;

		const now = Date.now();
		s.dismissed.push(now);
		s[userId] = now;

		this.suggestions = s;
	}
}
