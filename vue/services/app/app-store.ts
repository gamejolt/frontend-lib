import { User } from '../../../components/user/user.model';
import { VuexStore, VuexModule, VuexMutation } from '../../../utils/vuex';
import { namespace, State, Action, Mutation } from 'vuex-class';

export const AppState = namespace( 'app', State );
export const AppAction = namespace( 'app', Action );
export const AppMutation = namespace( 'app', Mutation );

export type Actions = {
};

export type Mutations = {
	'app/setUser': any,
	'app/clearUser': undefined;
	'app/setError': number;
	'app/clearError': undefined;
};

@VuexModule()
export class AppStore extends VuexStore<AppStore, Actions, Mutations>
{
	user: User | null = null;
	userBootstrapped = false;
	error: number | null = null;

	@VuexMutation
	setUser( user: Mutations['app/setUser'] )
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
	setError( error: Mutations['app/setError'] )
	{
		this.error = error;
	}

	@VuexMutation
	clearError()
	{
		this.error = null;
	}
}

export const appStore = new AppStore();
