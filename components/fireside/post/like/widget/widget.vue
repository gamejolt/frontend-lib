<template>
	<span class="fireside-post-like-widget">
		<app-popper
			trigger="manual"
			:show="isShowingFollowPopover"
			:block="block"
			@hide="isShowingFollowPopover = false"
			@auto-hide="onFollowPopoverDismissed"
		>
			<app-button
				:icon="isCircle ? 'heart' : undefined"
				:circle="isCircle"
				:overlay="overlay"
				:block="block"
				:primary="!!post.user_like || !isCircle"
				:solid="!!post.user_like"
				:badge="badge"
				v-app-tooltip="tooltip"
				v-app-auth-required
				@click="toggleLike"
			>
				<span v-if="!isCircle">
					<translate v-if="!post.user_like">Like This Post</translate>
					<translate v-else>Liked</translate>
				</span>
			</app-button>

			<div slot="popover" class="well fill-darkest">
				<p class="small">
					<translate>
						Would you also like to follow this user?
					</translate>
					<br />
					<translate>You will get notified when they post new stuff.</translate>
				</p>
				<app-user-follow-widget :user="post.user" block event-label="fireside-post-like-widget" />
			</div>
		</app-popper>

		<a @click="showLikers()" v-app-tooltip="$gettext(`View all people that liked this post`)">
			<span class="blip filled" v-if="blip">
				<span class="blip-caret"></span>
				<span class="blip-count">{{ blip }}</span>
			</span>
		</a>
	</span>
</template>

<script lang="ts" src="./widget"></script>
