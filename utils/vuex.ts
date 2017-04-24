import Vue from 'vue';
import Vuex from 'vuex';
import { WatchOptions } from 'vue';
import { Module } from 'vuex/types';

Vue.use( Vuex );

export type VuexDispatch<P> = <T extends keyof P>( type: T, value?: P[T] ) => Promise<any[]>;
export type VuexCommit<P> = <T extends keyof P>( type: T, value?: P[T] ) => void;

export type VuexWatch<S> = <T>(
	getter: ( state: S ) => T,
	cb: ( value: T, oldValue: T ) => void,
	options?: WatchOptions,
) => void;

export class VuexStore<S, A, M>
{
	readonly state: S;
	readonly getters: any;

	dispatch: VuexDispatch<A>;
	commit: VuexCommit<M>;

	watch: VuexWatch<S>;

	registerModule: <T>( path: string | string[], module: Module<T, S> ) => void;
	unregisterModule: ( path: string | string[] ) => void;
}

const storeInstance = new Vuex.Store( {} );

interface QueuedDecoratorCallback
{
	( store: any ): void;
}

let queuedDecorators: QueuedDecoratorCallback[] = [];

interface VuexModuleOptions
{
	store?: boolean;
	modules?: Vuex.ModuleTree<any>;
	namespaced?: boolean;
}

export function VuexModule( options: VuexModuleOptions = {} )
{
	const decorators = queuedDecorators;
	queuedDecorators = [];

	const storeOptions: Vuex.Module<any, any> = {
		modules: options.modules || {},
		namespaced: !options.store,
		state: {
			__vuexMutations: [],
			__vuexActions: [],
			__vuexGetterScope: undefined,
			__vuexActionScope: undefined,
			__vuexMutationScope: undefined,
		},
		getters: {},
		actions: {},
		mutations: {},
	};

	// A function that returns a function. Will be used as a constructor
	// function.
	return ( target: any ): any => () =>
	{
		// Copy over state.
		const instance = new target();
		for ( const key of Object.getOwnPropertyNames( instance ) ) {
			if ( !(key in storeInstance) ) {
				storeOptions.state[ key ] = instance[ key ];
			}
		}

		// This will be instantiated at the end as the store instance.
		let store: any;

		// Copy over getters.
		for ( const key of Object.getOwnPropertyNames( target.prototype ) ) {
			if ( key in Vuex.Store.prototype ) {
				continue;
			}

			const desc = Object.getOwnPropertyDescriptor( target.prototype, key );
			const getter = desc.get;
			if ( !getter ) {
				continue;
			}

			storeOptions.getters![ key ] = ( state, getters ) =>
			{
				const scope = getGetterScope( state, getters );
				return getter.apply( scope );
			};
		}

		// Apply the mutation and action decorators.
		for ( const cb of decorators ) {
			cb( storeOptions );
		}

		// Create the store instance. If it's the main store, we create it, if
		// it's not the main store we just use our options object.
		store = options.store ? new Vuex.Store( storeOptions ) : storeOptions;

		return store;
	};
}

export function VuexMutation( target: any, name: string, )
{
	const method = target[ name ];
	queuedDecorators.push( ( store ) =>
	{
		store.state.__vuexMutations.push( name );
		store.mutations![ name ] = ( state: any, ...args: any[] ) =>
		{
			const scope = getMutationScope( state );
			return method.apply( scope, args );
		};
	} );
}

export function VuexAction( target: any, name: string, )
{
	const method = target[ name ];
	queuedDecorators.push( ( store ) =>
	{
		store.state.__vuexActions.push( name );
		store.actions[ name ] = ( storeContext: any, ...args: any[] ) =>
		{
			const scope = getActionScope( storeContext );
			return method.apply( scope, args );
		};
	} );
}

function getGetterScope( state: any, getters: any )
{
	if ( !state.__vuexGetterScope ) {

		const scope: any = {};
		scopeNoStateChange( 'getter', scope, state );
		scopeNoCallers( 'getter', scope, state );

		// Attach getters on the scope so that getters can call other getters
		// and it still funnels through vuex.
		for ( const key of Object.getOwnPropertyNames( getters ) ) {
			Object.defineProperty( scope, key, {
				get: () => getters[ key ],
			} );
		}

		state.__vuexGetterScope = scope;
	}

	return state.__vuexGetterScope;
}

function getActionScope( store: any )
{
	if ( !store.state.__vuexActionScope ) {

		const scope: any = {};
		scopeNoStateChange( 'action', scope, store.state );

		// Mutations and actions will just funnel off to theire
		// store.(commit/dispatch) equivalents so that we continue to funnel
		// through vuex.
		for ( const key of store.state.__vuexMutations ) {
			scope[ key ] = ( ...args: any[] ) => store.commit( key, ...args );
		}

		for ( const key of store.state.__vuexActions ) {
			scope[ key ] = ( ...args: any[] ) => store.dispatch( key, ...args );
		}

		// Pull these into the scope so that parent modules can call into their
		// nested namespaced modules.
		scope.commit = ( ...args: any[] ) => store.commit( ...args );
		scope.dispatch = ( ...args: any[] ) => store.dispatch( ...args );

		store.state.__vuexActionScope = scope;
	}

	return store.state.__vuexActionScope;
}

function getMutationScope( state: any )
{
	if ( !state.__vuexMutationScope ) {

		// Set as our scope's prototype. This keeps the getters/setters working
		// for the main state data.
		const scope = Object.create( state );
		scopeNoCallers( 'mutation', scope, state );

		state.__vuexMutationScope = scope;
	}

	return state.__vuexMutationScope;
}

/**
 * Sets up the scope so that you can't modify state.
 */
function scopeNoStateChange( caller: string, scope: any, state: any )
{
	// Make a passthrough for all state to get. This allows us to throw an error
	// when they try setting within the action.
	for ( const key of Object.getOwnPropertyNames( state ) ) {
		const desc = Object.getOwnPropertyDescriptor( state, key );
		if ( !desc.get ) {
			continue;
		}
		Object.defineProperty( scope, key, {
			get: () => state[ key ],
			set: () => stateMutateError( caller, key ),
		} );
	}
}

/**
 * Sets up the scope so that you can't call mutations/actions on it.
 */
function scopeNoCallers( caller: string, scope: any, state: any )
{
	// Define these as properties so that we don't ovewrite the prototype's data
	// for these methods.
	for ( const key of state.__vuexMutations ) {
		Object.defineProperty( scope, key, {
			get: () => () => mutationError( caller, key ),
		} );
	}

	for ( const key of state.__vuexActions ) {
		Object.defineProperty( scope, key, {
			get: () => () => actionError( caller, key ),
		} );
	}

	return scope;
}

function stateMutateError( caller: string, field: string )
{
	throwError( `Couldn't modify field ${ field }. You can't modify state within a ${ caller }.` );
}

function mutationError( caller: string, mutation: string )
{
	throwError( `Couldn't commit ${ mutation }. You can't call mutations within a ${ caller }.` );
}

function actionError( caller: string, action: string )
{
	throwError( `Couldn't dispatch ${ action }. You can't call actions within a ${ caller }.` );
}

/**
 * Not all errors will be caught. This ensures that they see the error even if
 * it's not caught and shown.
 */
function throwError( msg: string )
{
	const error = new Error( msg );
	console.error( error );
	throw error;
}
