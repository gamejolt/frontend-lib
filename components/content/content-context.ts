export type ContentContext =
	| 'fireside-post-lead'
	| 'fireside-post-article'
	| 'game-description'
	| 'user-bio'
	| 'comment'
	| 'forum-post';

export type ContextCapabilityType =
	| 'text-bold'
	| 'text-italics'
	| 'text-underscore'
	| 'text-link'
	| 'image'
	| 'embed-video'
	| 'embed-music';

export class ContextCapabilities {
	public capabilities: ContextCapabilityType[];

	get hasAny() {
		return this.capabilities.length > 0;
	}
	get hasAnyText() {
		return this.textBold || this.textItalics || this.textUnderscore || this.textLink;
	}
	get textBold() {
		return this.hasCapability('text-bold');
	}
	get textItalics() {
		return this.hasCapability('text-italics');
	}
	get textUnderscore() {
		return this.hasCapability('text-underscore');
	}
	get textLink() {
		return this.hasCapability('text-link');
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
				return new ContextCapabilities(['text-bold', 'text-italics', 'text-underscore']);
			case 'fireside-post-article':
				return new ContextCapabilities([
					'text-bold',
					'text-italics',
					'text-underscore',
					'text-link',
					'image',
					'embed-video',
					'embed-music',
				]);
		}
		throw new Error('Context capabilities undefined for context ' + context);
	}
}
