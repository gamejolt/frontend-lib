<template>
	<app-base-content-component
		:is-editing="isEditing"
		:is-disabled="isDisabled"
		@removed="onRemoved"
	>
		<div class="gif-outer">
			<div
				class="gif-container"
				ref="container"
				:style="{
					width: containerWidth,
					height: containerHeight,
				}"
			>
				<video class="gif" loop autoplay muted playsinline :poster="media.preview">
					<source :src="media.webm.url" type="video/webm" />
					<source :src="media.mp4.url" type="video/mp4" />
				</video>
			</div>
		</div>
	</app-base-content-component>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.gif-outer
	width: 100%
	display: flex
	flex-direction: column
	margin-bottom: $line-height-computed
	min-height: 44px // make sure the X button fits properly, usually not a problem unless the image is super wide
	align-items: center

.gif-container
	display: flex
	justify-content: center
	align-items: center
	rounded-corners()
	overflow: hidden
	max-width: 100%
	position: relative

.gif-inner
	width: 100%
	position: relative
	height: auto
	display: flex
	justify-content: center
	rounded-corners()

.gif
	rounded-corners()

</style>

<script lang="ts" src="./gif"></script>
