import Vue from 'vue';

const eventBus = new Vue();

export class EventBus {
	static emit(event: string, ...args: any[]) {
		eventBus.$emit(event, ...args);
	}

	static on(event: string, callback: Function) {
		eventBus.$on(event, callback);
	}

	static once(event: string, callback: Function) {
		eventBus.$once(event, callback);
	}

	static off(event?: string, callback?: Function) {
		eventBus.$off(event, callback);
	}
}
