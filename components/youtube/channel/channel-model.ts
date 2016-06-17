import { Injectable } from 'ng-metadata/core';
import { Model } from './../../model/model-service';

export function Youtube_ChannelFactory( Model )
{
	return Model.create( Youtube_Channel, {
	} );
}

@Injectable()
export class Youtube_Channel extends Model
{
	user_id: number;
	channel_id: string;
	title: string;

	constructor( data?: any )
	{
		super( data );
	}

	$remove()
	{
		return this.$_remove( '/web/dash/linked-accounts/unlink/youtube-channel/' + this.channel_id, 'user' );
	}
}

// angular.module( 'gj.Youtube.Channel' ).factory( 'Youtube_Channel', function( Model, User, Api )
// {
// 	function Youtube_Channel( data )
// 	{
// 		if ( data ) {
// 			angular.extend( this, data );
// 		}

// 		if ( this.user ) {
// 			this.user = new User( this.user );
// 		}
// 	}

// 	Youtube_Channel.prototype.$remove = function()
// 	{
// 		return this.$_remove( '/web/dash/linked-accounts/unlink/youtube-channel/' + this.channel_id, 'user' );
// 	};

// 	return Model.create( Youtube_Channel );
// } );
