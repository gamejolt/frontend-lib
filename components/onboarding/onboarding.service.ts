import { Analytics } from '../analytics/analytics.service';

export type OnboardingStep = 'profile';

export default abstract class Onboarding {
	private static _currentStep: OnboardingStep | null = null;
	private static _currentStepStartedOn = 0;

	static get isOnboarding() {
		return localStorage.getItem('onboarding-start') !== null;
	}

	static start() {
		localStorage.setItem('onboarding-start', Date.now().toString());
	}

	static end() {
		const onboardStartedOn = parseInt(localStorage.getItem('onboarding-start') || '0', 10);
		if (onboardStartedOn) {
			localStorage.removeItem('onboarding-start');
			this.trackTiming('flow:all', 'took', Date.now() - onboardStartedOn);
		}
	}

	static startStep(step: OnboardingStep) {
		Onboarding.trackEvent(`flow:${step}`, 'start');

		this._currentStep = step;
		this._currentStepStartedOn = Date.now();
	}

	static endStep(skipped: boolean) {
		Onboarding.trackEvent(`flow:${this._currentStep}`, skipped ? 'skip' : 'next');
		Onboarding.trackTiming(
			`flow:${this._currentStep}`,
			'took',
			Date.now() - this._currentStepStartedOn
		);

		this._currentStep = null;
		this._currentStepStartedOn = 0;
	}

	static trackEvent(category: string, action: string, value?: string) {
		// Skip tracking if already onboarded.
		// This may happen if the onboard tab is open twice.
		// Currently the only place this happens is in non social registrations.
		if (this.isOnboarding) {
			Analytics.trackEvent(category, action, 'onboarding', value);
		}
	}

	static trackTiming(category: string, timingVar: string, value: number) {
		// Skip tracking if already onboarded.
		// This may happen if the onboard tab is open twice.
		// Currently the only place this happens is in non social registrations.
		if (this.isOnboarding) {
			Analytics.trackTiming(category, timingVar, value, 'onboarding');
		}
	}
}
