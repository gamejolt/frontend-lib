import Vue from 'vue';

export function findVueParent(component: Vue, parentType: typeof Vue) {
	let parent = component.$parent;
	while (parent) {
		if (parent instanceof parentType) {
			return parent;
		}
		parent = parent.$parent;
	}

	return undefined;
}

export function makeObservableService<T>(service: T): T {
	// We have to loop through all properties of the service and make them reactive.
	// We should only do it once.
	if (service && !(service as any).__gjObservable__) {
		for (const k in service) {
			(Vue as any).util.defineReactive(service, k, service[k]);
		}
		(service as any).__gjObservable__ = true;
	}

	return service;
}
