import { Model } from '../../model/model.service';

export class OrderAddress extends Model
{
	static readonly TYPE_BILLING = 'billing';
	static readonly TYPE_SHIPPING = 'shipping';

	order_id: number;
	type: string;
	fullname: string;
	street1: string;
	street2: string;
	city: string;
	region: string;
	postcode: string;
	country: string;

	constructor( data: any = {} )
	{
		super( data );
	}
}

Model.create( OrderAddress );
