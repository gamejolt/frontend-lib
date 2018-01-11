import { Model } from '../model/model.service';
import { PollItem } from './item/item.model';

export class Poll extends Model {
	static readonly STATUS_ACTIVE = 'active';
	static readonly STATUS_REMOVED = 'removed';

	fireside_post_id: number;
	created_on: number;
	end_time: number;
	duration: number;
	status: string;

	items: PollItem[];

	constructor(data?: any) {
		super(data);

		if (data && data.items) {
			this.items = PollItem.populate(data.items);
		} else {
			this.items = [];
		}
	}

	ensureMinimumItems() {
		for (let i = this.items.length; i < 2; i++) {
			PollItem.createForPoll(this, '');
		}
	}

	$save() {
		let url = '/web/polls/save';
		if (this.id) {
			url += `/${this.id}`;
		}

		const data: any = {
			fireside_post_id: this.fireside_post_id,
			duration: this.duration,
		};

		for (let i = 0; i < this.items.length; i++) {
			data['item' + (i + 1)] = this.items[i].text;
		}

		return this.$_save(url, 'poll', { data });
	}

	$remove() {
		return this.$_remove(`/web/polls/remove/${this.id}`);
	}

	$vote(itemId: number) {
		return this.$_save(`/web/polls/vote/${this.id}`, 'poll', { data: { item_id: itemId } });
	}
}

Model.create(Poll);
