import * as Vuex from 'vuex';

export const MutSetUser = `app/setUser`;
export const MutClearUser = `app/clearUser`;

export class AppState
{
	user?: any = undefined;
}

export const appStore: Vuex.Module<AppState, any> = {
	state: new AppState(),
	mutations: {
		[MutSetUser]( state, user: any )
		{
			state.user = user;
		},
		[MutClearUser]( state )
		{
			state.user = undefined;
		},
	},
};
