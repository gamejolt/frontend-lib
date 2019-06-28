<template>
	<div
		:class="{
			'message-thread-add': Screen.isXs,
		}"
	>
		<app-timeline-list-item>
			<app-user-avatar-img slot="bubble" :user="app.user" />

			<div class="timeline-list-item-details">
				<slot />
			</div>
		</app-timeline-list-item>
		<hr v-if="!hideMessageSplit" class="message-thread-split" />
	</div>
</template>

<style lang="stylus" scoped>
// On mobile, we need to make space for the content editor controls. They would overlap the Reply form field otherwise.
.message-thread-add
	padding-bottom: 42px
</style>

<script lang="ts" src="./add"></script>
