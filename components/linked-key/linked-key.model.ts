import { Model } from '../model/model.service';

export class LinkedKey extends Model
{
	static readonly PROVIDER_STEAM = 'steam';

	key: string;
	provider: typeof LinkedKey['PROVIDER_STEAM'];

	constructor( data: any = {} )
	{
		super( data );
	}
}

Model.create( LinkedKey );
