import * as Vuex from 'vuex';
import { User } from '../../../components/user/user.model';
import { StoreState } from '../../../../../app/store/index';

export const MutSetUser = `app/setUser`;
export const MutClearUser = `app/clearUser`;

export class AppState
{
	user?: User = undefined;
	userBootstrapped = false;
}

export const appStore: Vuex.Module<AppState, StoreState> = {
	state: new AppState(),
	mutations: {
		[MutSetUser]( state, user: any )
		{
			if ( state.user ) {
				state.user.assign( user );
			}
			else {
				state.user = user;
			}
			state.userBootstrapped = true;
		},
		[MutClearUser]( state )
		{
			state.user = undefined;
			state.userBootstrapped = true;
		},
	},
};
