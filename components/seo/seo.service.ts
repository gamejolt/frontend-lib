import { Meta } from '../meta/meta-service';

export type PayloadDirectives = {
	deindex?: boolean;
};

export class Seo {
	static processPayloadDirectives(data: PayloadDirectives) {
		if (data.deindex) {
			console.log('Deindexing page');
			Meta.seo.deindex();
		}
	}
}
