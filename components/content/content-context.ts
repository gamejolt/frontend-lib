export type ContentContext =
	| 'fireside-post-lead'
	| 'fireside-post-article'
	| 'game-description'
	| 'user-bio'
	| 'comment'
	| 'forum-post';

type ContextCapabilityType =
	| 'text-bold'
	| 'text-italics'
	| 'text-link'
	| 'text-code'
	| 'text-strike'
	| 'image'
	| 'embed-video'
	| 'embed-music'
	| 'code-block'
	| 'blockquote';

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
		return this.embedMusic || this.embedVideo;
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
	get image() {
		return this.hasCapability('image');
	}
	get embedVideo() {
		return this.hasCapability('embed-video');
	}
	get embedMusic() {
		return this.hasCapability('embed-music');
	}
	get codeBlock() {
		return this.hasCapability('code-block');
	}
	get blockquote() {
		return this.hasCapability('blockquote');
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
				return new ContextCapabilities(['text-bold', 'text-italics']);
			case 'fireside-post-article':
				return new ContextCapabilities([
					'text-bold',
					'text-italics',
					'text-link',
					'text-code',
					'text-strike',
					'image',
					'embed-video',
					'embed-music',
					'code-block',
					'blockquote',
				]);
		}
		throw new Error('Context capabilities undefined for context ' + context);
	}
}
