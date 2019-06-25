<template>
	<app-base-content-component
		:is-editing="isEditing"
		:is-disabled="isDisabled"
		@removed="onRemoved"
	>
		<div class="gif-container">
			<video class="gif" loop autoplay muted playsinline :poster="media.preview">
				<source :src="media.webm.url" type="video/webm" />
				<source :src="media.mp4.url" type="video/mp4" />
			</video>
		</div>
	</app-base-content-component>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.gif-container
	margin-bottom: $line-height-computed

	min-height: 44px // make sure the X button fits properly, usually not a problem unless the gif is super wide/untall
	max-height: 400px
	width: 100%

	rounded-corners()
	cursor: default
	display: flex
	justify-content: center

.gif
	height: 100%
	rounded-corners()

</style>

<script lang="ts" src="./gif"></script>
