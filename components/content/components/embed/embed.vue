<template>
	<app-base-content-component
		v-if="hasContent"
		:is-editing="isEditing"
		:is-disabled="isDisabled"
		@removed="onRemoved"
		class="embed-main"
	>
		<div class="embed-container">
			<app-video-embed
				v-if="type === 'youtube-video'"
				video-provider="youtube"
				:video-id="source"
			/>
			<app-content-embed-soundcloud v-else-if="type === 'soundcloud-song'" :track-id="source" />

			<div v-if="shouldShowOverlay" class="embed-overlay">
				<div class="embed-overlay-img" />
				<div class="embed-overlay-controls">
					<translate v-if="!hasSourceUrl">Go to source</translate>
					<external-link v-else :href="sourceUrl">
						<translate>Go to source</translate>
					</external-link>
				</div>
			</div>
		</div>
	</app-base-content-component>
	<div v-else contenteditable="false" class="input-container">
		<div class="embed-pill-container">
			<span class="help-inline"><translate>We support</translate></span>
			<external-link
				v-for="preview of previewEmbeds"
				:key="preview.name"
				:style="{ 'border-color': '#' + preview.color }"
				class="embed-pill"
				:href="preview.link"
			>
				<app-jolticon
					:icon="preview.icon"
					class="embed-pill-icon"
					:style="{ color: '#' + preview.color }"
				/>
				{{ preview.name }}
			</external-link>
			<span
				v-if="hasMoreEmbedPreviews"
				class="embed-pill embed-pill-more"
				@click.prevent="setRandomEmbedPills"
			>
				<app-jolticon icon="ellipsis-h" class="embed-pill-icon embed-pill-icon-more" />
				<translate>More</translate>
			</span>
		</div>
		<input
			ref="inputElement"
			class="-input"
			type="text"
			:value="source"
			:disabled="loading || isDisabled"
			@input="onInput"
			@keydown="onKeydown"
			:placeholder="$gettext(`Paste a link to what you want to embed`)"
		/>
		<div v-if="loading" class="input-overlay">
			<app-loading hide-label />
		</div>
	</div>
</template>

<style lang="stylus" src="./embed.styl" scoped></style>

<script lang="ts" src="./embed"></script>
