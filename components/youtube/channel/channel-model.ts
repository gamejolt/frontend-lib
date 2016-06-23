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
		return this.$_remove( '/web/dash/linked-accounts/unlink/youtube-channel/' + this.channel_id );
	}
}
