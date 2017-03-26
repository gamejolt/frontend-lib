import Vue from 'vue';
import { getProvider } from '../../utils/utils';

const eventBus = new Vue();

export class EventBus
{
	static emit( event: string, ...args: any[] )
	{
		if ( GJ_IS_ANGULAR ) {
			const $rootScope = getProvider<any>( '$rootScope' );
			$rootScope.$emit( event, ...args );
		}

		eventBus.$emit( event, ...args );
	}

	static on( event: string, callback: Function )
	{
		eventBus.$on( event, callback );
	}

	static once( event: string, callback: Function )
	{
		eventBus.$once( event, callback );
	}

	static off( event?: string, callback?: Function )
	{
		eventBus.$off( event, callback );
	}
}
