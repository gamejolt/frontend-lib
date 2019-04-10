<template>
	<div
		ref="container"
		class="content-editor-emoji-controls"
		:style="{
			bottom: this.bottom,
			left: this.left,
		}"
	>
		<div v-if="visible">
			<app-popper :show="true" trigger="manual" @hide="onHidePopper" placement="top">
				<div slot="popover" class="-emoji-list">
					<div class="text-muted">
						<translate>Select Emoji:</translate>
					</div>
					<span
						v-for="i of emojis"
						:key="i"
						:class="'-emoji-button emoji emoji-' + i"
						:title="':' + i + ':'"
						@click="() => onClickEmoji(i)"
					/>
				</div>
			</app-popper>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.content-editor-emoji-controls
	position: absolute

.-emoji-list
	padding: 4px
	width: 160px

.-emoji-button
	cursor: pointer
</style>

<script lang="ts" src="./emoji-controls"></script>
