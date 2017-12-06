import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./modal.html';

import { BaseModal } from '../../modal/base';
import { AppJolticon } from '../../../vue/components/jolticon/jolticon';
import { Comment } from '../comment-model';
import { AppCommentWidget } from '../widget/widget';
import { AppCommentModalComment } from './comment/comment';

@View
@Component({
	components: {
		AppJolticon,
		AppCommentWidget,
		AppCommentModalComment,
	},
})
export default class AppCommentModal extends BaseModal {
	@Prop(String) resource: string;
	@Prop(Number) resourceId: number;
	@Prop(Comment) comment?: Comment;
}
