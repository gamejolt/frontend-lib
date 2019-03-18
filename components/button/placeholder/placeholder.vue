<template>
	<div class="button-placeholder" :class="{ sparse, circle, block }"></div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.button-placeholder
	rounded-corners()
	theme-prop('background-color', 'bg-offset')
	display: inline-block
	height: $button-md-line-height
	vertical-align: middle
	width: 75px

	&.sparse
		width: $button-md-line-height

	&.circle
		img-circle()

	&.block
		display: block
		width: 100%
</style>

<script lang="ts" src="./placeholder" />
