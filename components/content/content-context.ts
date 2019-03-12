import { MediaItem } from '../media-item/media-item-model';
export type ContentContext =
	| 'fireside-post-lead'
	| 'fireside-post-article'
	| 'fireside-post-comment'
	| 'game-description'
	| 'game-comment'
	| 'user-comment'
	| 'user-bio'
	| 'forum-post';

type ContextCapabilityType =
	| 'text-bold'
	| 'text-italics'
	| 'text-link'
	| 'text-code'
	| 'text-strike'
	| 'media'
	| 'embed-video'
	| 'embed-music'
	| 'embed-game'
	| 'embed-user'
	| 'embed-community'
	| 'code-block'
	| 'blockquote'
	| 'gj-emoji'
	| 'lists'
	| 'hr'
	| 'spoiler'
	| 'table'
	| 'tag'
	| 'heading'
	| 'mention';

export class ContextCapabilities {
	public capabilities: ContextCapabilityType[];

	get hasAny() {
		return this.capabilities.length > 0;
	}
	get hasAnyText() {
		return (
			this.textBold || this.textItalics || this.textLink || this.textCode || this.textStrike
		);
	}
	get hasAnyEmbed() {
		return (
			this.embedMusic ||
			this.embedVideo ||
			this.embedGame ||
			this.embedUser ||
			this.embedCommunity
		);
	}
	get textBold() {
		return this.hasCapability('text-bold');
	}
	get textItalics() {
		return this.hasCapability('text-italics');
	}
	get textLink() {
		return this.hasCapability('text-link');
	}
	get textCode() {
		return this.hasCapability('text-code');
	}
	get textStrike() {
		return this.hasCapability('text-strike');
	}
	get media() {
		// for media items, also allows uploading through the media upload component
		return this.hasCapability('media');
	}
	get embedVideo() {
		return this.hasCapability('embed-video');
	}
	get embedMusic() {
		return this.hasCapability('embed-music');
	}
	get embedGame() {
		return this.hasCapability('embed-game');
	}
	get embedUser() {
		return this.hasCapability('embed-user');
	}
	get embedCommunity() {
		return this.hasCapability('embed-community');
	}
	get codeBlock() {
		return this.hasCapability('code-block');
	}
	get blockquote() {
		return this.hasCapability('blockquote');
	}
	get gjEmoji() {
		return this.hasCapability('gj-emoji');
	}
	get lists() {
		return this.hasCapability('lists');
	}
	get hr() {
		return this.hasCapability('hr');
	}
	get spoiler() {
		return this.hasCapability('spoiler');
	}
	get table() {
		return this.hasCapability('table');
	}
	get tag() {
		return this.hasCapability('tag');
	}
	get heading() {
		return this.hasCapability('heading');
	}
	get mention() {
		return this.hasCapability('mention');
	}

	private constructor(capabilities: ContextCapabilityType[]) {
		this.capabilities = capabilities;
	}

	public hasCapability(capability: ContextCapabilityType) {
		return this.capabilities.includes(capability);
	}

	public static getEmpty() {
		return new ContextCapabilities([]);
	}

	public static getForContext(context: ContentContext) {
		switch (context) {
			case 'fireside-post-lead':
				return new ContextCapabilities([
					'text-bold',
					'text-italics',
					'text-link',
					'gj-emoji',
					'tag',
					'mention',
				]);
			case 'game-description':
			case 'fireside-post-article':
				return new ContextCapabilities([
					'text-bold',
					'text-italics',
					'text-link',
					'text-code',
					'text-strike',
					'media',
					'embed-video',
					'embed-music',
					'embed-game',
					'embed-user',
					'embed-community',
					'code-block',
					'blockquote',
					'gj-emoji',
					'lists',
					'hr',
					'spoiler',
					'table',
					'tag',
					'heading',
					'mention',
				]);
			case 'game-comment':
			case 'user-comment':
			case 'fireside-post-comment':
				return new ContextCapabilities([
					'text-bold',
					'text-italics',
					'text-link',
					'text-code',
					'text-strike',
					'media',
					'embed-video',
					'embed-music',
					'code-block',
					'gj-emoji',
					'spoiler',
					'tag',
					'mention',
				]);
			case 'user-bio':
				return new ContextCapabilities([
					'text-bold',
					'text-italics',
					'text-link',
					'text-code',
					'text-strike',
					'code-block',
					'blockquote',
					'gj-emoji',
					'lists',
					'hr',
					'spoiler',
					'table',
					'tag',
					'mention',
				]);
		}
		throw new Error('Context capabilities undefined for context ' + context);
	}
}

export function getMediaItemTypeForContext(context: ContentContext) {
	switch (context) {
		case 'fireside-post-article':
			return MediaItem.TYPE_FIRESIDE_POST_ARTICLE_IMAGE;
		case 'game-description':
			return MediaItem.TYPE_GAME_DESCRIPTION;
		case 'fireside-post-comment':
		case 'game-comment':
		case 'user-comment':
			return MediaItem.TYPE_COMMENT;
		case 'forum-post':
			return MediaItem.TYPE_FORUM_POST;
	}
	throw new Error('There is no matching media item type for the context ' + context);
}
