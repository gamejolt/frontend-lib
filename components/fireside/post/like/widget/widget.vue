<template>
	<span class="fireside-post-like-widget">
		<span class="-like">
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

			<div v-if="isCircle && showLikeAnim" class="-like-anim-container">
				<app-jolticon class="-like-anim" icon="heart" notice />
			</div>
		</span>

		<a @click="showLikers()" v-app-tooltip="$gettext(`View all people that liked this post`)">
			<span class="blip filled" v-if="blip">
				<span class="blip-caret"></span>
				<span class="blip-count">{{ blip }}</span>
			</span>
		</a>
	</span>
</template>

<style lang="stylus" scoped>
.-like
	position: relative

.-like-anim-container
	position: absolute
	top: 0
	left: -2px
	width: 100%
	height: 100%
	display: flex
	justify-content: center
	align-items: center
	pointer-events: none

.-like-anim
	animation-name: like-anim
	animation-duration: 1s
	animation-iteration-count: 1
	animation-fill-mode: forwards

@keyframes like-anim
	0%
		transform: scale(1)
		opacity: 1

	100%
		transform: scale(6)
		opacity: 0
</style>

<script lang="ts" src="./widget"></script>
