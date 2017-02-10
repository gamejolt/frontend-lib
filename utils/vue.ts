import * as Vue from 'vue';

export function findVueParent( component: Vue, parentType: typeof Vue )
{
	let parent = component.$parent;
	while ( parent ) {
		if ( parent instanceof parentType ) {
			return parent;
		}
		parent = parent.$parent;
	}

	return undefined;
}
