import { Model } from '../../model/model.service';
import { Comment } from '../comment-model';
import { Game } from '../../game/game.model';

export class CommentVideo extends Model {
	video_id: string;
	channel_id: string;
	img_thumbnail: string;

	comment: Comment;
	game: any;

	constructor(data: any = {}) {
		super(data);

		if (data.comment) {
			this.comment = new Comment(data.comment);
		}

		if (data.game) {
			this.game = new Game(data.game);
		}
	}
}

Model.create(CommentVideo);
