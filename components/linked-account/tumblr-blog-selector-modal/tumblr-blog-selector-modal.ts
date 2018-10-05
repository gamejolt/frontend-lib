import View from '!view!./tumblr-blog-selector-modal.html';
import { Component, Prop } from 'vue-property-decorator';
import { stringSort } from '../../../utils/array';
import { AppLoading } from '../../../vue/components/loading/loading';
import { Api } from '../../api/api.service';
import { BaseModal } from '../../modal/base';
import { AppLinkedAccount } from '../linked-account';
import { LinkedAccount, TumblrBlog } from '../linked-account.model';

@View
@Component({
	components: {
		AppLinkedAccount,
		AppLoading,
	},
})
export default class AppModalTumblrBlogSelector extends BaseModal {
	@Prop(String)
	message!: string;

	@Prop(LinkedAccount)
	account!: LinkedAccount;

	@Prop(String)
	title!: string;

	isLoading = true;
	blogs: TumblrBlog[] = [];
	selectedBlog: TumblrBlog | null = null;

	get canConfirm() {
		return !!this.selectedBlog;
	}

	get hasBlogs() {
		return this.blogs && this.blogs.length > 0;
	}

	async created() {
		const payload = await Api.sendRequest(
			'/web/dash/linked-accounts/tumblr-blogs/' +
				this.account.game!.id +
				'/' +
				this.account.id,
			null,
			{ detach: true }
		);

		this.blogs = payload.blogs.sort((a: TumblrBlog, b: TumblrBlog) =>
			stringSort(a.name, b.name)
		);

		if (this.account.tumblrSelectedBlog) {
			this.selectedBlog = this.account.tumblrSelectedBlog;
		} else if (this.blogs.length > 0) {
			this.selectedBlog = this.blogs[0];
		}

		this.isLoading = false;
	}

	changeSelected(blogName: string) {
		const blog = this.blogs.find(b => b.name === blogName);
		if (blog) {
			this.selectedBlog = blog;
		}
	}

	ok() {
		this.modal.resolve(this.selectedBlog);
	}

	cancel() {
		this.modal.resolve(false);
	}
}
