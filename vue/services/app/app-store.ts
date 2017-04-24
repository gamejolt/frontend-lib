import { User } from '../../../components/user/user.model';
import { VuexStore, VuexModule, VuexMutation } from '../../../utils/vuex';
import { namespace, State, Action, Mutation, Getter } from 'vuex-class';

export const AppStoreNamespace = 'app';
export const AppState = namespace( AppStoreNamespace, State );
export const AppAction = namespace( AppStoreNamespace, Action );
export const AppMutation = namespace( AppStoreNamespace, Mutation );
export const AppGetter = namespace( AppStoreNamespace, Getter );

export type Actions = {
};

export type Mutations = {
	setUser: any,
	clearUser: undefined;
	setError: number;
	clearError: undefined;
};

@VuexModule()
export class AppStore extends VuexStore<AppStore, Actions, Mutations>
{
	user: User | null = null;
	userBootstrapped = false;
	error: number | null = null;

	@VuexMutation
	setUser( user: Mutations['setUser'] )
	{
		if ( this.user ) {
			this.user.assign( user );
		}
		else {
			this.user = user;
		}
		this.userBootstrapped = true;
	}

	@VuexMutation
	clearUser()
	{
		this.user = null;
		this.userBootstrapped = true;
	}

	@VuexMutation
	setError( error: Mutations['setError'] )
	{
		this.error = error;
	}

	@VuexMutation
	clearError()
	{
		this.error = null;
	}
}

export const appStore = new AppStore() as VuexStore<AppStore, Actions, Mutations>;
