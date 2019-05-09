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

enum ContextCapabilityType {
	TextBold,
	TextItalic,
	TextLink,
	TextCode,
	TextStrike,

	Emoji,
	Tag,
	Mention,

	Media,

	EmbedVideo,
	EmbedMusic,
	EmbedModel,

	CodeBlock,
	Blockquote,
	List,
	HorizontalRule,
	Spoiler,
	Table,
	Heading,
}

export class ContextCapabilities {
	public capabilities: ContextCapabilityType[];

	get hasAnyBlock() {
		return (
			this.hasAnyEmbed ||
			this.media ||
			this.codeBlock ||
			this.blockquote ||
			this.list ||
			this.hr ||
			this.spoiler ||
			this.table
		);
	}
	get hasAnyText() {
		return (
			this.textBold || this.textItalic || this.textLink || this.textCode || this.textStrike
		);
	}
	get hasAnyEmbed() {
		return this.embedMusic || this.embedVideo || this.embedModel;
	}
	get textBold() {
		return this.hasCapability(ContextCapabilityType.TextBold);
	}
	get textItalic() {
		return this.hasCapability(ContextCapabilityType.TextItalic);
	}
	get textLink() {
		return this.hasCapability(ContextCapabilityType.TextLink);
	}
	get textCode() {
		return this.hasCapability(ContextCapabilityType.TextCode);
	}
	get textStrike() {
		return this.hasCapability(ContextCapabilityType.TextStrike);
	}
	get media() {
		// for media items, also allows uploading through the media upload component
		return this.hasCapability(ContextCapabilityType.Media);
	}
	get embedVideo() {
		return this.hasCapability(ContextCapabilityType.EmbedVideo);
	}
	get embedMusic() {
		return this.hasCapability(ContextCapabilityType.EmbedMusic);
	}
	get embedModel() {
		return this.hasCapability(ContextCapabilityType.EmbedModel);
	}
	get codeBlock() {
		return this.hasCapability(ContextCapabilityType.CodeBlock);
	}
	get blockquote() {
		return this.hasCapability(ContextCapabilityType.Blockquote);
	}
	get emoji() {
		return this.hasCapability(ContextCapabilityType.Emoji);
	}
	get list() {
		return this.hasCapability(ContextCapabilityType.List);
	}
	get hr() {
		return this.hasCapability(ContextCapabilityType.HorizontalRule);
	}
	get spoiler() {
		return this.hasCapability(ContextCapabilityType.Spoiler);
	}
	get table() {
		return this.hasCapability(ContextCapabilityType.Table);
	}
	get tag() {
		return this.hasCapability(ContextCapabilityType.Tag);
	}
	get heading() {
		return this.hasCapability(ContextCapabilityType.Heading);
	}
	get mention() {
		return this.hasCapability(ContextCapabilityType.Mention);
	}

	private constructor(capabilities: ContextCapabilityType[]) {
		this.capabilities = capabilities;
	}

	private hasCapability(capability: ContextCapabilityType) {
		return this.capabilities.includes(capability);
	}

	public static getEmpty() {
		return new ContextCapabilities([]);
	}

	public static getForContext(context: ContentContext) {
		switch (context) {
			case 'fireside-post-lead':
				return new ContextCapabilities([
					ContextCapabilityType.TextBold,
					ContextCapabilityType.TextItalic,
					ContextCapabilityType.TextLink,
					ContextCapabilityType.Emoji,
					ContextCapabilityType.Tag,
					ContextCapabilityType.Mention,
				]);
			case 'fireside-post-article':
			case 'forum-post':
				return new ContextCapabilities([
					ContextCapabilityType.TextBold,
					ContextCapabilityType.TextItalic,
					ContextCapabilityType.TextLink,
					ContextCapabilityType.TextCode,
					ContextCapabilityType.TextStrike,
					ContextCapabilityType.Media,
					ContextCapabilityType.EmbedVideo,
					ContextCapabilityType.EmbedMusic,
					ContextCapabilityType.EmbedModel,
					ContextCapabilityType.CodeBlock,
					ContextCapabilityType.Blockquote,
					ContextCapabilityType.Emoji,
					ContextCapabilityType.List,
					ContextCapabilityType.HorizontalRule,
					ContextCapabilityType.Spoiler,
					ContextCapabilityType.Table,
					ContextCapabilityType.Tag,
					ContextCapabilityType.Heading,
					ContextCapabilityType.Mention,
				]);
			case 'game-description':
			case 'game-comment':
			case 'user-comment':
			case 'fireside-post-comment':
				return new ContextCapabilities([
					ContextCapabilityType.TextBold,
					ContextCapabilityType.TextItalic,
					ContextCapabilityType.TextLink,
					ContextCapabilityType.TextCode,
					ContextCapabilityType.TextStrike,
					ContextCapabilityType.Media,
					ContextCapabilityType.CodeBlock,
					ContextCapabilityType.Blockquote,
					ContextCapabilityType.Emoji,
					ContextCapabilityType.List,
					ContextCapabilityType.HorizontalRule,
					ContextCapabilityType.Spoiler,
					ContextCapabilityType.Table,
					ContextCapabilityType.Tag,
					ContextCapabilityType.Heading,
					ContextCapabilityType.Mention,
				]);
			case 'user-bio':
				return new ContextCapabilities([
					ContextCapabilityType.TextBold,
					ContextCapabilityType.TextItalic,
					ContextCapabilityType.TextLink,
					ContextCapabilityType.TextCode,
					ContextCapabilityType.TextStrike,
					ContextCapabilityType.CodeBlock,
					ContextCapabilityType.Blockquote,
					ContextCapabilityType.Emoji,
					ContextCapabilityType.List,
					ContextCapabilityType.HorizontalRule,
					ContextCapabilityType.Spoiler,
					ContextCapabilityType.Table,
					ContextCapabilityType.Tag,
					ContextCapabilityType.Mention,
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
