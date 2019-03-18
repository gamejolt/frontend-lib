<template>
	<div class="card-list-item" :class="{ active: isActive }">
		<app-card
			:is-expandable="isExpandable"
			:is-expanded="isActive"
			:is-draggable="isDraggable"
			@click.native="onClick"
		>
			<div class="card-drag-handle" v-if="isDraggable">
				<app-jolticon icon="arrows-v" />
			</div>
			<slot />
		</app-card>

		<div class="card-list-item-body full-bleed-xs">
			<app-expand :when="isActive">
				<div class="well fill-offset" :class="{ 'well-row': Screen.isXs }">
					<slot name="body" />
				</div>
			</app-expand>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'
@require './../../../well/well.styl'

.card-list-item
	&-body
		position: relative
		margin-top: -17px

		.card-list-add &
			margin-top: 5px

		&:before
			caret(color: var(--theme-bg-offset), direction: 'up', size: 10px)
			content: ''
			opacity: 0
			pointer-events: none
			transition: opacity 400ms

		~/.active &:before
			opacity: 1

	>>> form
		@extend .well
		theme-prop('background-color', 'bg')

		&:last-child
			margin-bottom: 0
</style>

<script lang="ts" src="./item" />
