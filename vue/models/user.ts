import { Model } from '../services/model/model';

export class User extends Model
{
	static TYPE_GAMER = 'User';
	static TYPE_DEVELOPER = 'Developer';

	type: 'User' | 'Developer';
	username: string;
	name: string;
	web_site: string;
	display_name: string;
	url: string;
	slug: string;
	img_avatar: string;
	dogtag: string;

	status: number;
	permission_level: number;
	is_verified: boolean;
	is_partner: boolean;

	created_on: number;
	last_logged_on: number;

	twitter_id?: string;
	twitter_screenname?: string;

	facebook_id?: string;
	facebook_name?: string;

	twitch_id?: string;
	twitch_name?: string;

	google_id?: string;
	google_nickname?: string;

	is_gamer = false;
	is_developer = false;

	constructor( data?: any )
	{
		super( data );

		if ( this.type === User.TYPE_GAMER ) {
			this.is_gamer = true;
		}
		else if ( this.type === User.TYPE_DEVELOPER ) {
			this.is_developer = true;
		}
	}
}
