import Vuex from 'vuex';
import { User } from '../../../components/user/user.model';
import { StoreState } from '../../../../../app/store/index';

export class AppState
{
	static readonly Mutations = {
		setUser: 'app/setUser',
		clearUser: 'app/clearUser',
		setError: 'app/setError',
		clearError: 'app/clearError',
	};

	user?: User = undefined;
	userBootstrapped = false;
	error?: number = undefined;
}

export const appStore: Vuex.Module<AppState, StoreState> = {
	state: new AppState(),
	mutations: {
		[AppState.Mutations.setUser]( state, user: any )
		{
			if ( state.user ) {
				state.user.assign( user );
			}
			else {
				state.user = user;
			}
			state.userBootstrapped = true;
		},
		[AppState.Mutations.clearUser]( state )
		{
			state.user = undefined;
			state.userBootstrapped = true;
		},
		[AppState.Mutations.setError]( state, error: number )
		{
			state.error = error;
		},
		[AppState.Mutations.clearError]( state )
		{
			state.error = undefined;
		},
	},
};
