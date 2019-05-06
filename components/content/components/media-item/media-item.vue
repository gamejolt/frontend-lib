<template>
	<app-base-content-component
		:is-editing="isEditing"
		:is-disabled="isDisabled"
		@removed="onRemoved"
		@edit="onEdit"
	>
		<div
			class="media-item"
			:style="{
				'align-items': itemAlignment,
			}"
		>
			<div
				class="media-item-container"
				ref="container"
				:style="{
					width: containerWidth,
					height: containerHeight,
				}"
			>
				<template v-if="isHydrated">
					<component :is="hasLink ? 'a' : 'span'" :href="hasLink ? href : undefined">
						<img
							class="img-responsive content-image"
							:src="mediaItem.img_url"
							:alt="title"
							:title="title"
						/>
					</component>
				</template>
				<template v-else-if="hasError">
					<translate>Error loading media item.</translate>
				</template>
				<template v-else>
					<app-loading />
				</template>
			</div>
			<span v-if="hasCaption" class="text-muted">
				<em>{{ caption }}</em>
			</span>
		</div>
	</app-base-content-component>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.media-item
	width: 100%
	display: flex
	flex-direction: column
	margin-bottom: $line-height-computed

.media-item-container
	display: flex
	justify-content: center
	align-items: center
	theme-prop('background-color', 'bg-offset')
	rounded-corners()
	overflow: hidden
	max-width: 100%

.caption-placeholder
	cursor: pointer
	pressy()

.content-image
	display: block
	margin-bottom: 0
	max-width: 100%
</style>

<script lang="ts" src="./media-item"></script>
