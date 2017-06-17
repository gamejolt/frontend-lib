import VueRouter from 'vue-router';
import { Scroll } from '../scroll.service';

export interface AutoscrollState {
	key: any;
	scroll: number;
}

export class Autoscroll {
	private static states: AutoscrollState[] = [];

	static height: string | null = null;

	static routeChange(to: VueRouter.Route, from: VueRouter.Route) {
		const scroll = Scroll.getScrollTop();
		// this.prevAnchor = Scroll.autoscrollAnchor;

		const fromState = this.getState(from.fullPath);
		if (fromState) {
			fromState.scroll = scroll;
			console.log('modify state', fromState);
		} else {
			this.states.push({
				key: from.fullPath,
				scroll,
			});

			console.log('add new state', this.states);
		}

		const toState = this.getState(to.fullPath);
		if (toState && toState.scroll) {
			this.height = toState.scroll + 'px';
		}
	}

	private static getState(key: any) {
		console.log('try to get state', key);
		return this.states.find(item => item.key === key);
	}
}
